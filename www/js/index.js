/*
    Authored by Pere Crespo

    Based on Chat Example for Bluetooth Serial PhoneGap Plugin
    http://github.com/don/BluetoothSerial

    Copyright 2013 Don Coleman

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/* jshint quotmark: false, unused: vars */
/* global cordova, bluetoothSerial, listButton, connectButton, sendButton, disconnectButton */
/* global setupform, deviceList, message, messages, statusMessage, setup_div, connection */
'use strict';
var cont_=0;
var myInterval=undefined; //Used to define javascript time intervals
var app = {
    initialize: function() {
        this.bind();
        listButton.style.display = "none";
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.foo(), and not this.foo()

        // wire buttons to functions
        connectButton.ontouchstart = app.connect;
        listButton.ontouchstart = app.list;

        sendButton.ontouchstart = app.sendDataSetup;
        startButton.ontouchstart = app.sendDataStart;
        stopButton.ontouchstart = app.sendDataStop;

        setupform.onsubmit = app.sendData;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        //bluetoothSerial.subscribe("z", app.onmessage, app.generateFailureFunction("Subscripció fallida"));
        //bluetoothSerial.subscribeRawData(app.onmessage, app.generateFailureFunction("Subscripció fallida"));

        $('#pageSetup').on( "pageshow", app.pageSetup);
        $('#pageSensors').on( "pageshow", app.pageSensors);
        $('.listMenu li').on('click', function() {
            //Everytime whe change to any main menu option we clear the current schedulling
            //stored at myInterval variable. Remember that everytime we test something
            //from our robot we send via BT a command in order to receive target data from the robot (sensors, encoders, compass, setup...)

            clearInterval(myInterval);
        });
        // get a list of peers
        setTimeout(app.list, 2000);
    },
    //Triggered when pageSetup is showed
    pageSetup: function(event) {

        messages.value="Showing setup parameters. Wait ...";
        cont_+=1;

        var data_ = new Uint8Array([0x6C,0x2E]); //Send sequence 'l.' to ask for Rogerbot settings
        var success = function () {

            messages.value = "Rogerbot donam configuració ....";
            messages.scrollTop = messages.scrollHeight;

            bluetoothSerial.readUntil('z', function (data) { //Funció traicionera retorna un string buit si no troba delimitador

              if (data.length<=9 && cont_<50) app.pageSetup(); //Si el string retornat es buit tornem a demanar
              else cont_=0;
              console.log("Read Rogerbot setup:"+data);
              var databak=data.substr(0,(data.length-1));
              if (data[0]=='o'){databak=data.substr(1,(data.length-1)); }   //BUG

              var res= databak.split(",");

              messages.value = " Velocitat="+parseInt(res[0])+" tel="+parseInt(res[1])+" Kp="+parseInt(res[2])+" Kd="+parseInt(res[3]);
              $("#velocitat").val(parseInt(res[0])).slider("refresh");
              $("#Kp").val(parseInt(res[2])).slider("refresh");
              $("#Kd").val(parseInt(res[3])).slider("refresh");

            }, failure);

        };
        var failure = function () {
            messages.value = "ERROR: Comunicació fallida";
            messages.scrollTop = messages.scrollHeight;
        };
        bluetoothSerial.write(data_, success, failure);
    },

    //Triggered when pageSensors is showed. Schedules a regular call to readSensor. This schedulling
    //is cancelled when we click other main menu option from the app
    pageSensors:function(event) {

      myInterval=setInterval(app.readSensor, 50); //Every 50 ms we do a robot bar sensor reading
    },
    //With this method we send the sequence 't.' to Rogerbot because we want to receive a bar sensor reading from him
    //the answer will be with the format number(positive or negative) in the range -9 to 9 followed with ending char 'z'
    readSensor:function(){
      var data_ = new Uint8Array([0x74,0x2E]); //Send sequence 't.' to ask for a Rogerbot bar reading sensor
      var failure = function () {
          messages.value = "ERROR: Comunicació fallida";
          messages.scrollTop = messages.scrollHeight;
      };
      var success = function () {

        bluetoothSerial.readUntil('z', function (data) {

          if (data.length==0) console.log("Cap dada rebuda al fer readSensor");
          else {
            $("#sensor_display").html(parseInt(data.substr(0,data.length-1)));
            var valor  = parseInt(data.substr(0,data.length-1));

            if (valor>=-9 && valor<=9){
              $("#img_sensor").attr("src","img/robot-rebird-2-0-sensor"+valor+".svg");
            }

            if (valor==-9) $("#sensorBanner").html("El robot se n'ha eixit per la dreta. La línia negra queda a l'esquerra");
            else if (valor==9) $("#sensorBanner").html("El robot se n'ha eixit per l'esquerra. La línia negra queda a la dreta");
            else $("#sensorBanner").html("Ves posicionant manualment cadascun dels sensors del robot sobre la línia negra...");
          }
          console.log("Read Rogerbot test sensor:"+data+" "+data.length);
        },failure);
      };
      bluetoothSerial.write(data_, success, app.generateFailureFunction("Send test asking"));
    },

    list: function(event) {
        deviceList.firstChild.innerHTML = "Descobrint...";
        app.setStatus("Cercant dispositius Bluetooth ...");
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("Llistat Fallit"));
    },
    connect: function() {
        var device = deviceList[deviceList.selectedIndex].value;
        app.disable(connectButton);
        app.setStatus("Connectant...");
        console.log("Sol·licitant connexió a " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Desconnectant...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },

    sendDataStart: function(event) {
        event.preventDefault();
        var data = new Uint8Array([0x61,0x2E]); //Send sequence 'a.' to start Rogerbot race
        var success = function () {
            messages.value = "Rogerbot al ataque....";
            messages.scrollTop = messages.scrollHeight;
        };
        var failure = function () {
            messages.value = "MEGDE";
            messages.scrollTop = messages.scrollHeight;
        };
        bluetoothSerial.write(data, success, failure);

    },
    sendDataStop: function(event) {
        event.preventDefault();
        var data = new Uint8Array([0x7A,0x2E]); //Send sequence 'z.' to start Rogerbot race
        var success = function () {
            messages.value = "Rogerbot PARA";
            messages.scrollTop = messages.scrollHeight;
        };
        var failure = function () {
            messages.value = "MEGDE";
            messages.scrollTop = messages.scrollHeight;
        };
        bluetoothSerial.write(data, success, failure);

    },
    //We send command 's'+speed+Kp+Kd+'.' to robot in order to save this new conf in the robot eeprom
    //TODO:Send telemetry enabler too
    sendDataSetup: function(event) {

        var data = new Uint8Array([0x73,$("#velocitat").val(),$("#Kp").val(),$("#Kd").val(),0x2E]);// 's' char start and '.' char ending delimiter

        var success = function () {
            messages.value = "Enviat per BT "+data[1]+" "+data[2]+" "+data[3]+" "+data[4];
            messages.scrollTop = messages.scrollHeight;
            bluetoothSerial.clear(function(){app.pageSetup();},failure);

        };
        var failure = function () {
            messages.value = "Error en sendDataSetup. No s'ha pogut enviar conf de rogerbot";
            messages.scrollTop = messages.scrollHeight;
        };

        bluetoothSerial.write(data, success, failure);
        app.setStatus("Desat...");

    },
    ondevicelist: function(devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("ondevicelist");

        devices.forEach(function(device) {

            option = document.createElement('option');
            if (device.hasOwnProperty("uuid")) {
                option.value = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                option.value = device.address;
            } else {
                option.value = "ERROR " + JSON.stringify(device);
            }
            option.innerHTML = device.name;
            deviceList.appendChild(option);
        });

        if (devices.length === 0) {

            option = document.createElement('option');
            option.innerHTML = "No dispositius Bluetooth ";
            deviceList.appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No periferics Bluetooth Descoberts.");
            } else { // Android
                app.setStatus("Per favor emparella un dispositiu bluetooth.");
            }

            app.disable(connectButton);
            listButton.style.display = "";
        } else {
            app.enable(connectButton);
            listButton.style.display = "none";
            app.setStatus("Trobats " + devices.length + " dispositiu" + (devices.length === 1 ? "." : "s."));
        }

    },
    onconnect: function() {
        //connection.style.display = "none";
        $.mobile.changePage("#pageSetup");
        setup_div.style.display = "block";
        app.setStatus("Connectat");
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        $.mobile.changePage("#pageInit");
        //connection.style.display = "block";
        app.enable(connectButton);
        //chat.style.display = "none";
        app.setStatus("Desconnectat");
    },

    //TODO:Not used at the moment pending final removal
    onmessage: function(message) {
      /*
      var bytes = new Uint8Array(message);
      for (i=0;i<bytes.length;i++){
        messages.value+=bytes[i]+" ";
      }

      if(message.byteLength==8){
        var bytes = new Uint8Array(message);
        if (!setup_showed){
          $("#velocitat").val(bytes[0]).slider("refresh");
          $("#Kp").val(bytes[4]).slider("refresh");
          $("#Kd").val(bytes[6]).slider("refresh");
          setup_showed=true;
        }
        messages.value = "Velocitat="+bytes[0]+" tel="+bytes[2]+" Kp="+bytes[4]+" Kd="+bytes[6];
      }
      messages.scrollTop = messages.scrollHeight;*/
    },
    setStatus: function(message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';
        //$("#statusMessage").fadeIn();
        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            //$("#statusMessage").fadeOut();
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function(button) {
        button.className = button.className.replace(/\bis-disabled\b/g,'');
    },
    disable: function(button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    }
};
