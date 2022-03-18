
"use strict";

const startScanning = (async () => {
    const filters = [];

    const filterName = ''; //document.querySelector('#name').value;
    if (filterName) {
        filters.push({ name: filterName });
    }

    const filterNamePrefix = ''; //document.querySelector('#namePrefix').value;
    if (filterNamePrefix) {
        filters.push({ namePrefix: filterNamePrefix });
    }

    const options = {};

    const allAdvertisements = true; //document.querySelector('#allAdvertisements').checked;
    if (allAdvertisements) {
        options.acceptAllAdvertisements = true;
    } else {
        options.filters = filters;
    }

    try {
        log('Requesting Bluetooth Scan with options: ' + JSON.stringify(options));
        const scan = await navigator.bluetooth.requestLEScan(options);

        log('Scan started with:');
        log(' acceptAllAdvertisements: ' + scan.acceptAllAdvertisements);
        log(' active: ' + scan.active);
        log(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
        log(' filters: ' + JSON.stringify(scan.filters));

        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            const manufacturerData = [...event.manufacturerData].map((valueDataView, key) => logDataView('Manufacturer', key, valueDataView));
            const serviceData = [...event.serviceData].map((valueDataView, key) => logDataView('Service', key, valueDataView));
            
            if (filterBeacon(serviceData.join('\n')) || filterBeacon(manufacturerData.join('\n'))) {
                log('\n\nAdvertisement received.');
                log('  Device Name: ' + event.device.name);
                log('  Device ID: ' + event.device.id);
                log('  RSSI: ' + event.rssi);
                log('  TX Power: ' + event.txPower);
                log('  UUIDs: ' + event.uuids);
                log(manufacturerData.join('\n'));
                log(serviceData).join('\n');
            }
        });

        setTimeout(stopScan, 10000);

        function stopScan() {
            log('Stopping scan...');
            scan.stop();
            log('Stopped.  scan.active = ' + scan.active);
        }
    } catch (error) {
        log('Argh! ' + error);
    }
});

const filterBeacon = ((str) => {
    return true;
    //return str.includes(' 00 00 00');
    //return !!str.match(/ 64 [0-9a-f][0-9a-f] [0-9a-f][0-9a-f] [0-9a-f][0-9a-f] 00 00 00/);
});

const log = ((str) => {
    document.getElementById('output').innerText += str + '\n';
});

document.getElementById('goButton').addEventListener('click', (() => {
    startScanning();
}));

const logDataView = (labelOfDataSource, key, valueDataView) => {
    const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
        return b.toString(16).padStart(2, '0');
    }).join(' ');
    
    const textDecoder = new TextDecoder('ascii');
    const asciiString = textDecoder.decode(valueDataView.buffer);
    
    const output = [
        `\tlabel=${labelOfDataSource} Data: key=${key}`,
        `\n\t\t(Hex) ${hexString}`,
        `\n\t\t(ASCII) ${asciiString}`
    ].join('');

    return output;
};