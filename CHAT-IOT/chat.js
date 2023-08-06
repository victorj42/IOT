const name_input = document.getElementById("name_input");
const message_input = document.getElementById("message_input");
const chat_window = document.getElementById("chat_window");
const log = document.getElementById("log")
conexServer = false;
conexRoom = false;
tema = document.getElementById("room")

//Elegimos el id de forma aleatoria para que no haya dos mismos usuarios

const client_id = "chat_client_"+Math.random();

//Creamos conexión MQTT

const options={
    connectTimeout: 4000,
    //Authenticación      
    clientId: client_id,
    //username: 'emqx'
    //password: 'emqx'
    keepalive: 60,
    clean: true,
}


const Websocket_URL = 'ws://iotprojects.site:8083/mqtt'
const client = mqtt.connect(Websocket_URL, options)

log.innerHTML='ERROR: No connection to the server'

client.on('connect', ()=> {
    console.log('Connect success');
    log.innerHTML='<p style="color:rgb(18, 240, 18)"> Server Connect Success </p><br>';
    conexServer=true;
})

client.on('message', function (topic, message){
    const received = JSON.parse(message.toString());

    if (received.name.trim() == name_input.value.trim()){
        chat_window.innerHTML = chat_window.innerHTML + '<div style="color:blue">'+ received.msg+'</b></div>'
    }else{
        chat_window.innerHTML = chat_window.innerHTML + '<div style="color:grey"><i> '+ received.name+ ': </i>'+received.msg+'</b></div>'
    }

    chat_window.scrollTop = chat_window.scrollHeight // para que cuando scrolle se vea la última conversación
})

//Añadimos un listener para el cuadro de texto donde escribimos el mensaje, 
//a enviar, para que cuando pulsemos un enter, este haga algo.

message_input.addEventListener('keyup', function (e){
	if(e.key === 'Enter'){
        if (conexRoom){
            if (name_input.value == ""){
                chat_window.innerHTML = chat_window.innerHTML + '<div style="color:red"><b> Name field is empty!!! </b></div>';
                return;
            }
        }else{
            log.innerHTML=log.innerHTML+'<p style="color:red"> Not connected to any room. </p>';
            return;
        }
	
        const to_send = {
            name: name_input.value,
            msg: message_input.value
        }

        console.log(JSON.stringify(to_send));
        client.publish(tema.value, JSON.stringify(to_send));
        message_input.value="";
    }
});

function conectRoom(){
    if (tema.options[tema.selectedIndex].value != "Choose"){
        client.subscribe(tema.value, function (err) {
            if(conexServer){
                if(!err){
                    console.log("Sucripción exitosa");
                    log.innerHTML=log.innerHTML+'<p style="color:rgb(18, 240, 18)">Connected to room: '+ tema.options[tema.selectedIndex].text+'</p>';
                    conexRoom = true;
                }else{
                    console.log("Error al suscribirse a la sala " + tema.options[tema.selectedIndex].text);
                    log.innerHTML=log.innerHTML+'<p style="color:red"> Error connecting to room ' + tema.options[tema.selectedIndex].text+'</p>';
                }
            }else{
                console.log('<p style="color:red"> Error al conectarse al servidor ' + tema.options[tema.selectedIndex].text+'</p>');
                log.innerHTML=log.innerHTML+'Unable to connect to the server <br>';
            }
        })
    }
}
