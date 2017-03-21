# ITRobot
Inspecció tècnica de Robots. Pensat per al Rogerbot de l'IES l'Estació d'Ontinyent

Based on Bluetooth Serial Chat Example from https://github.com/don/BluetoothSerial

Some assembly required.

I'll assume you've cloned https://github.com/pedcremo/ITRobot.git into ~/ITRobot

This code requires [cordova-cli](https://github.com/apache/cordova-cli), which require [node.js](http://nodejs.org)

    $ npm install cordova -g

Adding platforms generates the native projects

    $ cordova platform add android
    $ cordova platform add ios

Install the Bluetooth Serial plugin with cordova

    $ cordova plugin add com.megster.cordova.bluetoothserial
    $ cordova plugin add cordova-plugin-bluetooth-serial

This code requires an Android device since the emulator does not support Bluetooth. Pair your Android device the Bluetooth modem running on the Arduino.

Build and deploy to an Android device. (Emulate deploys to the connected device.)

    $ cordova run android

This code uses Bluetooth and requires an iOS device, rather than the emulator.  The iOS version uses Bluetooth Low Energy, so there's no need to pair with the remove device.  The iOS code *only* connects to Red Bear Labs BLE Mini http://redbearlab.com/blemini/

Build the code

    $ cordova build ios

Open Xcode and deploy to your device

    $ open platforms/ios/ITRobot.xcodeproj

NOTE: Don't edit the HTML or JS in the generated projects. Edit the source in ~/ITRobot/www and rebuild with cordova-cli.
