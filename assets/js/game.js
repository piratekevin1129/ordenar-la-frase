var i = 0
var j = 0
var k = 0

function getRand(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function unorderArray(lon){
	while(unorder_array.length<lon){
		var n = getRand(1,lon)
		if(!unorder_array.includes(n)){
			unorder_array.push(n)
		}
	}
}

var game_width = 845
var game_height = 507

var palabra_move = getE('palabra-move')
var palabra_clicked = null
var palabra_clicked_rect = null
var espacios_coll = []
var frases_coll = []
var palabras_coll = []
var posx_e = 0
var posy_e = 0
var unorder_array = []
var frase_cortada = []
var respuesta_cortada = []

function setGame(){
	frase_cortada = global_data.frase.split(" ")
	respuesta_cortada = global_data.respuesta.split(" ")
	unorderArray(frase_cortada.length)
	console.log(unorder_array)

	for(i = 0;i<frase_cortada.length;i++){
		var u = unorder_array[i]
		var fe = document.createElement('div')
		fe.className = 'frase-element'
		fe.id = 'frase'+u
		fe.innerHTML = '<p>...</p>'
		fe.setAttribute('key','')
		getE('frase-wrap').appendChild(fe)
		
		var pe = document.createElement('div')
		pe.className = 'palabra-element palabra_clicked'
		pe.id = 'palabra'+u
		pe.setAttribute('ind',u)
		pe.setAttribute('onmousedown','downPalabra(this,event)')
		pe.setAttribute('key',frase_cortada[u-1])
		pe.innerHTML = '<p>'+frase_cortada[u-1]+'</p>'
		getE('palabras-wrap').appendChild(pe)

		var ee = document.createElement('div')
		ee.className = 'espacio-element espacio-element-empty'
		ee.id = 'espacio'+u
		ee.setAttribute('ind',u)
		ee.setAttribute('key','')
		ee.setAttribute('value','')
		var h = '<div class="espacio-palabra"></div><button class="espacio-eliminar" onclick="quitarPalabra(this)"></button>'
		ee.innerHTML = h
		getE('espacios-wrap').appendChild(ee)

		espacios_coll.push(ee)
		palabras_coll.push(pe)
		frases_coll.push(fe)
	}

}

function downPalabra(palabra_div,e){
	drag_mp3.currentTime = 0
	drag_mp3.play()
	window.addEventListener('mousemove',movePalabra,false)
	window.addEventListener('mouseup',upPalabra,false)

	palabra_clicked = palabra_div
	palabra_clicked_rect = {
		width:palabra_div.offsetWidth,
		height:palabra_div.offsetHeight
	}
	palabra_move.innerHTML = palabra_clicked.innerHTML
	palabra_clicked.classList.remove('palabra_sola')
	palabra_clicked.classList.add('palabra_clicked')	

	posx_e = e.pageX
	posy_e = e.pageY
	palabra_move.style.left = (posx_e-(palabra_clicked_rect.width/2))+'px'
	palabra_move.style.top = (posy_e-(palabra_clicked_rect.height/2))+'px'
	palabra_move.className = 'palabra-move-on'

	//poner espacios alumbrando, menos los ocupados
	for(i = 0;i<espacios_coll.length;i++){
		var clase_actual = espacios_coll[i].className
		if(clase_actual.indexOf('empty')!=-1){
			espacios_coll[i].classList.add('espacio-element-active')
		}
	}
}
function movePalabra(e){
	posx_e = e.pageX
	posy_e = e.pageY
	palabra_move.style.left = (posx_e-(palabra_clicked_rect.width/2))+'px'
	palabra_move.style.top = (posy_e-(palabra_clicked_rect.height/2))+'px'
}
function upPalabra(e){
	window.removeEventListener('mousemove',movePalabra,false)
	window.removeEventListener('mouseup',upPalabra,false)

	//quitar alumbraciones
	for(i = 0;i<espacios_coll.length;i++){
		espacios_coll[i].classList.remove('espacio-element-active')
	}

	palabra_move.className = 'palabra-move-off'

	var toca_espacio = -1
	//detectar colision con espacios
	for(i = 0;i<espacios_coll.length;i++){
		var rect_espacio = espacios_coll[i].getBoundingClientRect()
		if(
			posx_e>rect_espacio.left&&posx_e<(rect_espacio.left+espacios_coll[i].offsetWidth)&&
			posy_e>rect_espacio.top&&posy_e<(rect_espacio.top+espacios_coll[i].offsetHeight)
		){
			//mirar que no esté ocupado ya
			var clase_actual = espacios_coll[i].className
			if(clase_actual.indexOf('empty')!=-1){
				toca_espacio = i
			}
		}
	}

	if(toca_espacio!=-1){
		espacios_coll[toca_espacio].classList.remove('espacio-element-empty')
		espacios_coll[toca_espacio].classList.add('espacio-element-occuped')
		espacios_coll[toca_espacio].setAttribute('key',palabra_clicked.getAttribute('ind'))
		espacios_coll[toca_espacio].setAttribute('value',palabra_clicked.getAttribute('key'))

		var texto = espacios_coll[toca_espacio].getElementsByClassName('espacio-palabra')[0]
		texto.innerHTML = palabra_clicked.innerHTML
		frases_coll[toca_espacio].innerHTML = palabra_clicked.innerHTML
		frases_coll[toca_espacio].setAttribute('key',palabra_clicked.getAttribute('key'))
	}else{
		palabra_clicked.classList.remove('palabra_clicked')
		palabra_clicked.classList.add('palabra_sola')
	}
}

function quitarPalabra(btn,s){
	if(s==null||s==undefined){
		remove_mp3.play()
	}
	
	var padre = btn.parentNode
	var ind = padre.getAttribute('ind')
	var key = padre.getAttribute('key')

	getE('palabra'+key).classList.remove('palabra_clicked')
	getE('palabra'+key).classList.add('palabra_sola')

	padre.classList.remove('espacio-element-occuped')
	padre.classList.add('espacio-element-empty')
	padre.setAttribute('key','')
	padre.setAttribute('value','')
	var texto = padre.getElementsByClassName('espacio-palabra')[0]
	texto.innerHTML = ''

	getE('frase'+ind).innerHTML = '<p>...</p>'
	getE('frase'+ind).setAttribute('key','')
}

var intentos = 0
var animacion_palabra_correcta = null

function comprobarJuego(){
	var frase = ""
	
	for(i = 0;i<frases_coll.length;i++){
		frase+=frases_coll[i].getAttribute('key')
	}
	
	var esta = false
	var frase_corta = String(global_data.respuesta).replace(new RegExp(" ","g"), "")
	
	if(frase==frase_corta){
		esta = true
	}

	if(esta){
		//alert("bien, ganaste")
		pararReloj()
		getE('frase-wrap').classList.add('frase-wrap-win')
		setModal({
			msg:'<span>'+titulo_final+',</span> '+mensaje_final+'.<br />',
			icon:'success',
			close:false,
			continue:true,
			action:'nextTema',
			label:'Continuar'
		})
	}else{
		var stars = getE('tra_estrellas').getElementsByClassName('tra_estrella')
		//quitar estrella
		stars[intentos].classList.remove('tra_estrella_off')
		stars[intentos].classList.add('tra_estrella_on')
		incorrect_mp3.currentTime = 0
		incorrect_mp3.play()
		
		intentos++
		if(intentos==3){
			//alert("perdiste")
			//mostrar la correcta
			pararReloj()
			getE('comprobar-btn').disabled = true
			getE('frase-correcta-txt').className = 'frase-correcta-txt-show'
			j = 0
			animacion_palabra_correcta = setInterval(function(){
				if(j==frases_coll.length){
					clearInterval(animacion_palabra_correcta)
					animacion_palabra_correcta = null

					setModal({msg:'<span>'+titulo_final_mal+'</span>'+mensaje_final_mal+'<br />Haz clic en el botón <span>Reiniciar</span> para jugar de nuevo',close:false})
				}else{
					frases_coll[j].innerHTML = '<p>'+respuesta_cortada[j]+'</p>'
					frases_coll[j].classList.add('frase-element-on')
					j++
				}
			},200)
		}else{
			//dejar las buenas y quitar las malas
			for(i = 0;i<espacios_coll.length;i++){
				var value = espacios_coll[i].getAttribute('value')
				if(value!=''){
					if(value==respuesta_cortada[i]){
						//este esta bueno
					}else{
						//quitar este
						var btn = espacios_coll[i].getElementsByClassName('espacio-eliminar')[0]
						quitarPalabra(btn,true)
					}
				}
			}
		}
	}
}

/**********MODALES***********/
function setModal(params){
	var msg = params.msg
	var icon = 'error'
	var close = true
	if(params.icon!=null&&params.icon!=undefined){
		icon = params.icon
	}
	if(params.close!=null&&params.close!=undefined){
		close = params.close
	}

	if(icon=='success'){
		document.getElementById('modal-icon-msg').className = 'modal-icon-msg-success'
	}else{
		document.getElementById('modal-icon-msg').className = 'modal-icon-msg-error'
	}
	if(close){
		document.getElementById('modal-close-msg').style.visibility = 'visible'
	}else{
		document.getElementById('modal-close-msg').style.visibility = 'hidden'
	}

	var continue_btn = ''
	var msg_full = '<p>'+msg+'</p>'
	if(params.continue!=null&&params.continue!=undefined){
		continue_btn+='<button class="modal-continue-btn" onmouseover="overContinue()" onclick="'+params.action+'()">'+params.label+'</button>'
		msg_full+=continue_btn
	}

	document.getElementById('modal-text-msg').innerHTML = msg_full

	document.getElementById('modal').className = 'modal-on'
	victoria_mp3.play()
}

function overContinue(){
	button_mp3.play()
}

function unsetModal(){
	document.getElementById('modal').className = 'modal-off'
}

function openInstrucciones(){
	instrucciones.className = 'instrucciones-on'
}

function closeInstrucciones(){
	if(first_instrucciones){
		first_instrucciones = false
		
		underground_mp3.play()
		setTimer()
		j = 0
		animacion_palabra_correcta = setInterval(function(){
			if(j==palabras_coll.length){
				clearInterval(animacion_palabra_correcta)
				animacion_palabra_correcta = null
			}else{
				palabras_coll[j].classList.remove('palabra_clicked')
				palabras_coll[j].classList.add('palabra_sola')
				j++
			}
		},100)
	}
	instrucciones.className = 'instrucciones-off'
}

var first_instrucciones = true

function setTimer(){
	iniciarReloj()
}

function getE(idname){
	return document.getElementById(idname)
}

function reloadGame(){

}

function nextTema(){

}