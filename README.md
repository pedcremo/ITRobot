# ITRobot
Inspecció tècnica de Robots. Pensat per al Rogerbot de l'IES l'Estació d'Ontinyent

PROBLEMS: If we download latest android studio with tools version 25.2.3 or upper android command disapears and
consequently cordova projects doesn't work. Read step by step instructions at the end of README to fix it

This app blueetooth code is based on Bluetooth Serial Chat Example from https://github.com/don/BluetoothSerial

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

Build and deploy to an Android device. (Emulate deploys to the connected device.) Be sure to install android SDK . An easy way to do it could be install android studio

    $ cordova run android

This code uses Bluetooth and requires an iOS device, rather than the emulator.  The iOS version uses Bluetooth Low Energy, so there's no need to pair with the remove device.  The iOS code *only* connects to Red Bear Labs BLE Mini http://redbearlab.com/blemini/

Build the code

    $ cordova build ios

Open Xcode and deploy to your device

    $ open platforms/ios/ITRobot.xcodeproj

NOTE: Don't edit the HTML or JS in the generated projects. Edit the source in ~/ITRobot/www and rebuild with cordova-cli.


TIP: chrome://inspect/ per debugging via usb (enable usb debugging in android settings)

Installation of Cordova For Linux (ubuntu ) step by step

1. Clone the github repository (install git if you don’t have it already):

    $ git clone https://github.com/pedcremo/ITRobot.git

2. Install the JDK 8 of Java by PPA:

    $ sudo add-apt-repository ppa:webupd8team/java
    $ sudo apt-get update
    $ sudo apt-get install oracle-java8-installer

3. Install node.js (install curl if you don’t have it already):

    $ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    $ sudo apt-get install -y nodejs

4. Clone Cordova-cli from Github:

    $ git clone https://github.com/apache/cordova-cli.git

5. Install npm:
    
    $ sudo apt-get install npm

6. Install Cordova:
    
    $ sudo npm install cordova -g

7. Add Android and the Bluetooth libraries to ITRobot:
    
    $ cordova platform add android
    $ cordova plugin add com.megster.cordova.bluetoothserial
    $ cordova plugin add cordova-plugin-bluetooth-serial

8. Install Android Studio:
https://developer.android.com/studio/index.html

9. Execute it and install a latest version than 25.x.x of the Android SDK:
    
    $ cd ~/Downloads/android-studio/bin
    $ ./studio.sh

10. Write this code at the bottom of ~/bashrc:

    $ sudo nano ~/.bashrc
    export ANDROID_HOME=$HOME/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/tools

11. Remove the tools folder from ~/Android/Sdk and add the tools folder from this link:

https://dl.google.com/android/repository/tools_r22.6.2-linux.zip

12. Finally you can connect your android device (activate debugging in settings/development tools) to your computer, enter to your ITRobot folder and write the following command to compile your program:

    $ cordova run android
