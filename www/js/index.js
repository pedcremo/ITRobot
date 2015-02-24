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

        sendButton.ontouchstart = app.sendData;
        setupform.onsubmit = app.sendData;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        //bluetoothSerial.subscribe("z", app.onmessage, app.generateFailureFunction("Subscripció fallida"));
        bluetoothSerial.subscribeRawData(app.onmessage, app.generateFailureFunction("Subscripció fallida"));

        // get a list of peers
        setTimeout(app.list, 2000);
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
    sendData: function(event) {
        event.preventDefault();
        // Typed Array
        var data = new Uint8Array(4);
        data[0] = 0x30;
        data[1] = 0x30;
        data[2] = 0x30;
        data[3] = 0x7A;

        var success = function () {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };

        bluetoothSerial.write(data, success, failure);
        //bluetoothSerial.write([parseInt(velocitat.value),parseInt(Kp.value),parseInt(Kd.value),'z'], success);
        app.setStatus("Desat...");
        /*var text = message.value + "\n";
        var success = function () {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };

        bluetoothSerial.write(text, success);*/
        return false;
    },
    ondevicelist: function(devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

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
            app.setStatus("Trobat " + devices.length + " dispositiu" + (devices.length === 1 ? "." : "s."));
        }

    },
    onconnect: function() {
        //connection.style.display = "none";
        $.mobile.changePage("#pagetwo");
        setup_div.style.display = "block";
        app.setStatus("Connectat");
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        $.mobile.changePage("#pageone");
        //connection.style.display = "block";
        app.enable(connectButton);
        //chat.style.display = "none";
        app.setStatus("Desconnectat");
    },
    onmessage: function(message) {

      /*bluetoothSerial.available(function(numBytes){
                if (numBytes==8) {
                  var bytes = new Uint8Array(message);
                  messages.value = " Velocitat="+bytes[0]+" tel="+bytes[2]+" Kp="+bytes[4]+" Kd="+bytes[6];
                  //bluetoothSerial.clear();
                }
                //else messages.value="MERDA"
      }, app.generateFailureFunction("Available fallida"));
*/
      if(message.byteLength==8){
        var bytes = new Uint8Array(message);
        //velocitat.value=bytes[0];Kp.value=bytes[4];Kd.value=bytes[6];
        $("#velocitat").val(bytes[0]).slider("refresh");
        $("#Kp").val(bytes[4]).slider("refresh");
        $("#Kd").val(bytes[6]).slider("refresh");
        messages.value = "Velocitat="+bytes[0]+" tel="+bytes[2]+" Kp="+bytes[4]+" Kd="+bytes[6];
      }
        //console.log(bytes);
      //}else{
      //  messages.value=bytes.length;
      //}
        /*messages.value = message.length+" Velocitat="+message.charCodeAt(0).toString(2)+" tel="+message.charCodeAt(2)+" Kp="+message.charCodeAt(4)+" Kd="+message.charCodeAt(6);
      */
      messages.scrollTop = messages.scrollHeight;
    },
    setStatus: function(message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
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
