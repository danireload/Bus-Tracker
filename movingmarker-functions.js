//apis public transport Rio
  //VLT
  //Internvalo de Trens (fixo)
    //Tipo de Requisição: Get
    //Campos de Requisição: sem Parâmetros
    //organização dos campos de resposta: array of objects
    //Campos de Resposta:
      //dia (util ou fds), hora (faixa horária), tempoEspera (segundos)
    //URL: https://www.vltrio.com.br/api/tempo_espera
    //Retorna todas as faixas horárias
  // ETA entre estações
    //Tipo de Requisição:
    //Campos de Requisição: Número das Estações
    //organização dos campos de resposta: single object
    //Campos de Resposta:
      //etaSeconds, encodedPolyline
      //events[0]: lineName, direction (nome estação), lineColor, from (nome estação), to (nome estação), toDirection  (nome estação), encodedPolyline
    //URL: https://www.vltrio.com.br/api/eta?from=6&to=22
  //Conexões com Outros Modais
    //Tipo de Requisição: Get
    //Campos de Requisição: sem Parâmetros
    //organização dos campos de resposta: array of objects
    //Campos de Resposta:
      //title['BR'], conexaoIMG, content['BR']
    //URL: https://www.vltrio.com.br/api/conexao
  //Linhas do VLT
    //Tipo de Requisição: Get
    //Campos de Requisição: sem Parâmetros
    //organização dos campos de resposta: array of objects
    //Campos de Resposta:
      //name, id, encodedPolyline, lineColor
    //URL: https://www.vltrio.com.br/api/linha
  //Estações do VLT
    //Tipo de Requisição: Get
    //Campos de Requisição: sem Parâmetros
    //organização dos campos de resposta: array of objects
    //Campos de Resposta:
      //_id, type, latitude, longitude, status
      //integrations(array of objects with only numbers)
      //lines (array of objects with only numbers) with name and directions
      //name['BR']
    //URL: https://www.vltrio.com.br/api/estacao

//main functions:
  //uber to user location
    //preview route function
      //get user location and start point
      //black arc line
      //destination marker: square
      //start marker: circle or circle with icon
      //calculate distance
      //calculate time with avg speed
      //adjust bbbox to arc line
    //track uber to user location
      //destination marker: square with tooltip showing remaining distance
      //reduce route line as vehicle moves
      //adjust bbbox as vehicle moves
      //adapt vehicle marker to vehicle type
        //option of marker as non-rotating pin whit vehicle image in center
      //rotate vehicle marker
      //calculate remaining distance and time as marker moves
      //alert when less then 800m to destination

  //airport to airport
    //preview route
      //greatCircle line between airports on red color
      //airport markers as circle markers with tooltip
      //animate airports areas
      //adjust bbox to airports roite
      //calculate distance of route
  //busroute
    //circle markers as bus stops
    //yellow line as bus route
  //create icons function
  //custom L.div roubd marker for subway with img on center based on station properties

startlocation()
async function startlocation(){
  var userloc  = await getuserlocation();
  var usermarker = L.marker(userloc);
  usermarker.id = 'userloc';
  usermarker.addTo(map);
  previewdistance()
}

function previewdistance(){
  var userloc = getlayerbycustomid('userloc');
  console.log(userloc);
  var destination = [-22.802294535135648, -43.254547119140625];;

  //map.fitBounds([userloc, destination]);
  //map.flyTo(e.latlng);
}

//var layer = getlayerbycustomid(id);

//getstartendpoints()

function getbbox(){
  //on start
  var boundpolygon = boundstoarea(map.getBounds());
  var points  = fetchpoints(); //download and save in pouch db
  //also download and save bus lines in pouch db
  //create ids for bus stops
  var pointsinview = pointsinradiusarea(points, boundpolygon);

  map.on('zoomstart', function() {
    var boundpolygon = boundstoarea(map.getBounds());
    var points  = fetchpoints();
    var pointsinview = pointsinradiusarea(points, boundpolygon);
    //add icons on positions inside polygon
  });
  map.on('zoomend', function() {
    //add icons
  });
}

function boundstoarea(bounds){
  //bounds = _southWest and northEast coords
  var southeast = [bounds._southWest.lat, bounds._northEast.lng];
  var northwest = [bounds._northEast.lat, bounds._southWest.lng];

  var polygoncoords = Object.values(bounds);
  polygoncoords[0] = [polygoncoords[0].lat, polygoncoords[0].lng];
  polygoncoords[1] = [polygoncoords[1].lat, polygoncoords[1].lng];
  polygoncoords.splice(1, 0, northwest);
  polygoncoords.push(southeast);
  polygoncoords.push(polygoncoords[0]);

  var polybbox = flipturfcoords(turf.polygon([polygoncoords]));
  return polybbox
}

async function getuserlocation(){

  //if windows location service is on, function under does not work
  map.locate({setView: true}) //, watch: true, maxZoom: 16 timeout: 10000 //Number of milliseconds to wait for a response from geolocation before firing a locationerror event.
  //stopLocate() //

  var userloc;
  //map.on('locationfound', onLocationFound);
  map.on('locationfound', function(e){
    console.log(e);
    userloc = e.latlng;
    return userloc
  });
  map.on('locationerror', onLocationError);
}

async function getstartendpoints(){

  var getbusroute = 'https://raw.githubusercontent.com/danireload/danireload.github.io/master/bus%20route';
  var busroute = await getpath(getbusroute);
  var getlinefromgeom = await busroute.features[0].geometry.coordinates;

  //start point will be user location
  var getstartmarker = getlinefromgeom[0];
  //var nearest = turf.nearestPoint(targetPoint, points); //turf.point, turf.featureCollection
  //above in featrure collection is points of bus stops

  var getendmarker = getlinefromgeom[getlinefromgeom.length - 1];
  var startmarker = L.marker(getstartmarker);
  var endmarker = L.marker(getendmarker);
  startmarker.addTo(map);
  endmarker.addTo(map);

  var stopsnear = pointsinradius(getstartmarker);//find stops near user

  getaddbusroute(); //(getstartmarker, getendmarker)
}

//addcurvedlinebetweenpoints()
function addcurvedlinebetweenpoints(){
  var getstartmarker = [-22.94745, -43.18255];
  var getendmarker = [-22.94217, -43.19233];

  //turfgreatCircle(getstartmarker, getendmarker);
   var getcurvedlinemidpoint = line2curve(getstartmarker, getendmarker);
   var fixcurvedlinemidpoint = fixline2curvemidpoint(getcurvedlinemidpoint, {curvedirection: 'top'});
   var getcurvedline = createcurvedPath(fixcurvedlinemidpoint, {color: 'yellow', dashArray: '10, 10', dashOffset: '4'}); // , weight: 5//color: 'rgb(255, 215, 0)'
   //console.log(getcurvedline.trace([0.25, 0.5, 0.75]));
   //above only works after curve has been added to map

   getcurvedline.addTo(map);
   //map.fitBounds(getcurvedline.getBounds());
}

function line2curve (latlng1, latlng2, options){
  //Credits: Ryan Catalani
  //Source: https://gist.github.com/ryancatalani/6091e50bf756088bf9bf5de2017b32e6

  // Requires:
    // Leaflet: http://leafletjs.com/
    // Leaflet.curve: https://github.com/elfalem/Leaflet.curve
  // Optional: Turf.js: https://turfjs.org/
    // Assumes:
    // var map is a Leaflet map and already set up.

  var latlngs = [];

  var offsetX = latlng2[1] - latlng1[1],
	offsetY = latlng2[0] - latlng1[0];

  var r = Math.sqrt( Math.pow(offsetX, 2) + Math.pow(offsetY, 2) ),
	theta = Math.atan2(offsetY, offsetX);

  var thetaOffset = (3.14/10);

  var r2 = (r/2)/(Math.cos(thetaOffset)),
	theta2 = theta + thetaOffset;

  var midpointX = (r2 * Math.cos(theta2)) + latlng1[1],
	midpointY = (r2 * Math.sin(theta2)) + latlng1[0];

  var midpointLatLng = [midpointY, midpointX];

  latlngs.push(latlng1, midpointLatLng, latlng2);

  return latlngs;

  //if (typeof document.getElementById('LEAFLET_MAP').animate === "function") {
    //	var durationBase = 2000;
    // 	var duration = Math.sqrt(Math.log(r)) * durationBase;
    // Scales the animation duration so that it's related to the line length
    // (but such that the longest and shortest lines' durations are not too different).
    // You may want to use a different scaling factor.
    //  	pathOptions.animate = {
    //		duration: duration,
    //		iterations: Infinity,
    //		easing: 'ease-in-out',
    //		direction: 'alternate'
    //	}
    //}
}

function fixline2curvemidpoint(latlngs, options){

  var newlatlngs = [];

  var latlng1 = latlngs[0];
  var latlng2 = latlngs[2];
  var midpointLatLng = latlngs[1];

  if (options.hasOwnProperty('curvedirection')) {
    var turfline = turf.lineString([latlng1, latlng2]);
    var turfmidpoint = turf.center(turfline);
    var beziermidpoint = turf.point(midpointLatLng);
    var bezierbearing = turf.bearing(turfmidpoint, beziermidpoint);
    var turfoptions = {units: 'miles'};
    var distance = turf.distance(turfmidpoint, beziermidpoint, turfoptions);

    if (options.curvedirection == 'top') {
      var bearing = 90;
      var destination = turf.destination(turfmidpoint, distance, bearing, turfoptions);
      midpointLatLng = turf.getCoords(destination);
    }else if (options.curvedirection == 'bottom') {
      var bearing = -90;
      var destination = turf.destination(turfmidpoint, distance, bearing, turfoptions);
      midpointLatLng = turf.getCoords(destination);
    }
  }else {

  }

  latlngs.push(latlng1, midpointLatLng, latlng2);
  return latlngs;
}

function createcurvedPath(latlngs, pathOptions){

  var latlng1 = latlngs[0];
  var latlng2 = latlngs[2];
  var midpointLatLng = latlngs[1];

  var curvedPath = L.curve(
    [
      'M', latlng1,
      'Q', midpointLatLng,
      latlng2
    ], pathOptions);

return curvedPath;
}

function pointsinradius(startpos){
  var radiusarea = radiusaspolygon(startpos);
  var getpoints = fetchpoints(); //bus stops
  var pointsinradius = geomtoturf(pointsinradiusarea(getpoints, radiusarea));
  //add to map features of reversegeom?
  //distance from user to nearest bus stop
  return pointsinradius
}

async function getaddbusroute (){
  var getbusroute = 'https://raw.githubusercontent.com/danireload/danireload.github.io/master/bus%20route';
  var busroute = await getpath(getbusroute);
  var getlinefromgeom = await busroute.features[0].geometry.coordinates;
  var leafletroute = L.polyline(getlinefromgeom);
  leafletroute.addTo(map);
  //map.fitBounds(pathtodestination.getBounds());
  var turfroute = busroute.features[0];
  var getroutedistance = routedistance(turfroute);
  var linetomarker = L.polyline([], {color: 'green'});
  linetomarker.id = 'path';
  linetomarker.addTo(map);

  var getroutetime  = routetime(getroutedistance, {transportmode: 'cycling', speedunit:'kmh'});

  getaddbuspath();
}

function routetime(routedistance, options){

  if (options.hasOwnProperty('transportmode')) {
    var transportmode = options.transportmode;
  }
  if (options.hasOwnProperty('speedunit')) {
    var speedunit = options.speedunit;
  }

  var getavgspeed = speedavarages(transportmode);
  var newseped = convertspeeds(getavgspeed, {originalspeedunit: 'kmh', newspeedunit: speedunit});

  var getroutetime = routedistance/speedavarages(transportmode)*60; //time in minutes

  var routetime = getroutetime.toFixed(0); //.toFixed(2) needs to round seconds of 60 or more to above
  return routetime
}

function convertspeeds(inputspeed, options){

  if (options.hasOwnProperty('originalspeedunit')) {
    var originalspeedunit = options.originalspeedunit;
  }
  if (options.hasOwnProperty('newspeedunit')) {
    var newspeedunit = options.newspeedunit;
  }

  switch (originalspeedunit) {
    case 'ms':
      if (newspeedunit == 'kmh') {
        var newspeed = ms2kmh(inputspeed);
      }else if (newspeedunit == 'mph') {
        var newspeed = ms2mph(inputspeed);
      }
      else if (newspeedunit == 'knot') {
        var newspeed = ms2knot(inputspeed);
      }else if ('feetps') {
        var newspeed = ms2feetps(inputspeed)
      }
      break;
    case 'kmh':
      if (newspeedunit == 'ms') {
        var newspeed = kmh2ms(inputspeed);
      }else if (newspeedunit == 'mph') {
        var newspeed = kmh2mph(inputspeed);
      }else if (newspeedunit == 'knot') {
        var newspeed = kmh2knot(inputspeed);
      }else if (newspeedunit == 'feetps') {
        var newspeed = kmh2feetps(inputspeed);
      }
      break;
    case 'mph':
      if (newspeedunit == 'ms') {
        var newspeed = mph2ms(inputspeed);
      }else if (newspeedunit == 'kmh') {
        var newspeed = mph2kmh(inputspeed);
      }else if (newspeedunit == 'knot') {
        var newspeed = mph2knot(inputspeed);
      }else if (newspeedunit == 'feetps') {
        var newspeed = mph2feetps(inputspeed);
      }
      break;
    case 'knot': //nmh //One knot equals one nautical mile per hour
      if (newspeedunit == 'ms') {
        var newspeed = knot2ms(inputspeed);
      }else if (newspeedunit == 'kmh') {
        var newspeed = knot2kmh(inputspeed);
      }else if (newspeedunit == 'mph') {
        var newspeed = knot2mph(inputspeed);
      }else if (newspeedunit == 'feetps') {
        var newspeed = knot2feetps(inputspeed);
      }
      break;
    case 'feetps':
      if (newspeedunit == 'ms') {
        var newspeed = feetps2ms(inputspeed);
      }else if (newspeedunit == 'kmh') {
        var newspeed = feetps2kmh(inputspeed);
      }else if (newspeedunit == 'mph') {
        var newspeed = feetps2mph(inputspeed);
      }else if (newspeedunit == 'knot') {
        var newspeed = feetps2knot(inputspeed);
      }
      break;
    default:
  }
  return newspeed;
}

function convertdistance(inputdistance, options){

  if (options.hasOwnProperty('originaldistanceunit')) {
    var originaldistanceunit = options.originaldistanceunit;
  }
  if (options.hasOwnProperty('newdistanceunit')) {
    var newdistanceunit = options.newdistanceunit;
  }

  switch (originaldistanceunit) {
    case 'cm':
      if (newdistanceunit == 'km') {
        var newdistance = cm2km(inputdistance);
      }else if (newdistanceunit == 'm') {
        var newdistance = cm2m(inputdistance);
      }else if (newdistanceunit == 'mi') {
        var newdistance = cm2mi(inputdistance);
      }else if (newdistanceunit == 'ft') {
        var newdistance = cm2ft(inputdistance);
      }else if (newdistanceunit == 'nm') {
        var newdistance = cm2nm(inputdistance);
      }
      break;
      case 'm':
        if (newdistanceunit == 'cm') {
          var newdistance = m2cm(inputspeed);
        }else if (newdistanceunit == 'km') {
          var newdistance = m2km(inputspeed);
        }else if (newdistanceunit == 'mi') {
          var newdistance = m2mi(inputspeed);
        }else if (newdistanceunit == 'ft') {
          var newdistance = m2ft(inputspeed);
        }else if (newdistanceunit == 'nm') {
          var newdistance = m2nm(inputspeed);
        }
        break;
      case 'km':
        if (newdistanceunit == 'cm') {
          var newdistance = km2cm(inputspeed);
        }else if (newdistanceunit == 'm') {
          var newdistance = km2m(inputspeed);
        }else if (newdistanceunit == 'mi') {
          var newdistance = km2mi(inputspeed);
        }else if (newdistanceunit == 'ft') {
          var newdistance = km2ft(inputspeed);
        }else if (newdistanceunit == 'nm') {
          var newdistance = km2nm(inputspeed);
        }
        break;
      case 'mi':
        if (newdistanceunit == 'cm') {
          var newdistance = mi2cm(inputspeed);
        }else if (newdistanceunit == 'm') {
          var newdistance = mi2m(inputspeed);
        }else if (newdistanceunit == 'km') {
          var newdistance = mi2km(inputspeed);
        }else if (newdistanceunit == 'ft') {
          var newdistance = mi2ft(inputspeed);
        }else if (newdistanceunit == 'nm') {
          var newdistance = mi2nm(inputspeed);
        }
        break;
    case 'ft':
      if (newdistanceunit == 'cm') {
        var newdistance = ft2cm(inputspeed);
      }else if (newdistanceunit == 'm') {
        var newdistance = ft2m(inputspeed);
      }else if (newdistanceunit == 'km') {
        var newdistance = ft2km(inputspeed);
      }else if (newdistanceunit == 'mi') {
        var newdistance = ft2mi(inputspeed);
      }else if (newdistanceunit == 'nm') {
        var newdistance = ft2nm(inputspeed);
      }
      break;
    case 'nm':
      if (newdistanceunit == 'cm') {
        var newdistance = nm2cm(inputspeed);
      }else if (newdistanceunit == 'm') {
        var newdistance = nm2m(inputspeed);
      }else if (newdistanceunit == 'km') {
        var newdistance = nm2km(inputspeed);
      }else if (newdistanceunit == 'mi') {
        var newdistance = nm2mi(inputspeed);
      }else if (newdistanceunit == 'ft') {
        var newdistance = nm2ft(inputspeed);
      }
      break;
    default:
  }
  return newdistance
}

//distsalonglinetooltips()
function distsalonglinetooltips(polyline){

  var line = turf.lineString([polyline.coords]);

  var distance =vpolyline.coordinates[0].distanceTo(polyline.coordinates[polyline.coordinates.length-1]);
  var along = turf.along(line, 1, {unit: 'kilometers'})

}

var c = 0;
async function getaddbuspath(){

  var getbuspos = await getbusposition();

  var layer = getlayerbycustomid('path');
  layer.addLatLng(getbuspos['coords']);

  if (c == 1) {
    layer.speeds = [];
    layer.timestamps = [];
    layer.linenumber = '';
  }else if (c == 2) {
    //detect bus direction
    //get distances of start position and route start and route end
    //get distances of second position and route start and route end
    //compare ditances to get bus direction?

    var getlatlngs = getpolylinelatlngs(layer, getbuspos);
    //send speeds to moving marker if avaiable
    movemarkerline(getlatlngs);
  }else if (c > 2) {
    var getlatlngs = getpolylinelatlngs(layer, getbuspos);
    movemarkerline(getlatlngs);
  }
}

function getpolylinelatlngs(layer, getbuspos){
  var getlatlngs = layer.getLatLngs();
  var latlngs = [];
  getlatlngs.forEach((item, i) => {
    latlngs.push(Object.values(item));
  });
  if (getbuspos.hasOwnProperty('speed')) {
    layer.speeds.push(getbuspos['speed']);
  }
  if (getbuspos.hasOwnProperty('timestamp')) {
    layer.timestamps.push(getbuspos['speed']);
  }
  return([latlngs, c]);
}

function movemarkerline(array){
  var icon = '';
  var line = '';
  //if icon as marker and moving marker and rotation
  //or if marker as pin with vehicle image and moving marker and no rotation
  //or if no marker and line being reduced as moving
  //if line of path traveled

  var MyCustomMarker = L.Icon.extend({
      options: {
          shadowUrl: null,
          iconAnchor: new L.Point(12, 12),
          iconSize: new L.Point(24, 24),
          iconUrl: 'https://www.pngfind.com/pngs/m/216-2169825_plane-icon-png-airplane-icon-png-transparent-png.png'
      }
  });

  var smallIcon1 = new L.Icon({
      iconSize: [40, 60],
      //iconAnchor: [0, 0],
      iconUrl: 'https://www.pngitem.com/pimgs/m/46-460720_airplane-top-down-png-png-download-plane-svg.png' //use round svg image?
  });
  var myIcon = L.divIcon({
  iconSize: [25, 30], //for font-size: 20px
  className: 'my-div-icon',
  html: '<div class="icon-in-div"><i class="fas fa-plane"></i><p class="icon-label">Flight 4431</p></div>' /*<i class="material-icons">flight_takeoff</i>*/
  });

  var ubersquareicon = L.divIcon({
    className: 'uber-square',
    html: '<div class="uber-circle"></div>'
  });
  //L.marker([50.505, 30.57], {icon: ubersquareicon}).addTo(map);
  //var setubersquaremarkerstyle = document.getElementsByClassName('uber-square')[0];
  //setubersquaremarkerstyle.style.height = "05px";
  //setubersquaremarkerstyle.style.width = "05px";
  //setubersquaremarkerstyle.style.backgroundColor = "black";
  //setubersquaremarkerstyle.style.border = "5px solid black";
  //var setubercirclemarkerstyle = document.getElementsByClassName('uber-circle')[0];
  //setubercirclemarkerstyle.style.height = "05px";
  //setubercirclemarkerstyle.style.width = "05px";
  //setubercirclemarkerstyle.style.margin = "0px auto";
  //setubercirclemarkerstyle.style.borderRadius = "50%";
  //setubercirclemarkerstyle.style.backgroundColor = "white";

  movingmarker(array, myIcon);
}

function fetchpoints(){

  //use fetch to get points

  var featureCollection = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.19098949432373,-22.939898589901855]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.18506717681885,-22.942348891449527]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.184852600097656,-22.946577533338626]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.185367584228516,-22.95384890761542]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.18008899688721,-22.934681671138865]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.2037353515625,-22.943020740577328]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.19596767425537,-22.955311038946775]}}]};

  var geomtoturfgeom = geomtoturf(featureCollection);
  return geomtoturfgeom
}

function speedavarages(input){

  var avgspeed; //all speed in km/h

  switch (input) {
    case 'walking':
      avgspeed = 4.2;
      break;
    case 'cycling':
      avgspeed = 15;
      break
    case 'urbanbus':
      avgspeed = 17;
      break;
    case 'brt':
      avgspeed = 42;
      break;
    default:
  }
  return avgspeed
}

//speed convertions
  //meters per seconds to other speed units
  function ms2kmh(inputspeed){
    var newspeed = inputspeed * 3.6;
    return newspeed
  }
  function ms2mph(inputspeed){
    var newspeed = inputspeed * 2.23694;
    return newspeed
  }
  function ms2knot(inputspeed){
    var newspeed = inputspeed * 1.94384;
    return newspeed
  }
  function ms2feetps(inputspeed){
    var newspeed = inputspeed * 3.28084;
    return newspeed
  }
  //kilometers per hour to other speed units
  function kmh2ms(inputspeed){
    var newspeed = inputspeed * 0.277778;
    return newspeed
  }
  function kmh2mph(inputspeed){
    var newspeed = inputspeed * 0.621371;
    return newspeed
  }
  function kmh2knot(inputspeed){
    var newspeed = inputspeed * 0.911344;
    return newspeed
  }
  function kmh2feetps(inputspeed){
    var newspeed = inputspeed * 0.911344;
    return newspeed
  }
  //miles per hour to other speed units
  function mph2ms(inputspeed){
    var newspeed = inputspeed * 0.44704;
    return newspeed
  }
  function mph2kmh(inputspeed){
    var newspeed = inputspeed * 1.60934;
    return newspeed
  }
  function mph2knot(inputspeed){
    var newspeed = inputspeed * 0.868976;
    return newspeed
  }
  function mph2feetps(inputspeed){
    var newspeed = inputspeed * 1.46667;
    return newspeed
  }
  //knots (nautical miles per hour) to other speed units
  function knot2ms(inputspeed){
    var newspeed = inputspeed * 0.514444;
    return newspeed
  }
  function knot2kmh(inputspeed){
    var newspeed = inputspeed * 1.852;
    return newspeed
  }
  function knot2mph(inputspeed){
    var newspeed = inputspeed * 1.15078;
    return newspeed
  }
  function knot2feetps(inputspeed){
    var newspeed = inputspeed * 1.68781;
    return newspeed
  }
//feet per seconds to other speed units
  function feetps2ms(inputspeed){
    var newspeed = inputspeed * 0.3048;
    return newspeed
  }
  function feetps2kmh(inputspeed){
    var newspeed = inputspeed * 1.09728;
    return newspeed
  }
  function feetps2mph(inputspeed){
    var newspeed = inputspeed * 0.681818;
    return newspeed
  }
  function feetps2knot(inputspeed){
    var newspeed = inputspeed * 0.592484;
    return newspeed
  }
//distance convertions
  //meter to  other distance units
  function m2cm(inputspeed){
    var newspeed = inputspeed * 100;
    return newspeed
  }
  function m2km(inputspeed){
    var newspeed = inputspeed * 0.001;
    return newspeed
  }
  function m2mi(inputspeed){ //meter2mile
    var newspeed = inputspeed * 0.000621371;
    return newspeed
  }
  function m2ft(inputspeed){ //meter2feet
    var newspeed = inputspeed * 3.28084;
    return newspeed
  }
  function m2nm(inputspeed){ //meter2nautical mile
    var newspeed = inputspeed * 0.000539957;
    return newspeed
  }
  //centimeter to  other distance units
  //function cm2km(inputspeed){ //meter2nautical mile
  //  var newspeed = inputspeed * 1e-5;
  //  return newspeed
  //}
  function cm2m(inputspeed){ //meter2nautical mile
    var newspeed = inputspeed * 0.01;
    return newspeed
  }
  //function cm2mi(inputspeed){ //meter2nautical mile
  //  var newspeed = inputspeed * 6,2137e-6;
  //  return newspeed
  //}
  function cm2ft(inputspeed){ //meter2nautical mile
    var newspeed = inputspeed * 0.0328084;
    return newspeed
  }
  //function cm2nm(inputspeed){ //meter2nautical mile
  //  var newspeed = inputspeed * 5,3996e-6;
  //  return newspeed
  //}
  //kilometer to  other distance units
  function km2cm(inputspeed){
    var newspeed = inputspeed * 100;
    return newspeed
  }
  function km2m(inputspeed){
    var newspeed = inputspeed * 1000;
    return newspeed
  }
  function km2mi(inputspeed){
    var newspeed = inputspeed * 0.621371;
    return newspeed
  }
  function km2ft(inputspeed){
    var newspeed = inputspeed * 3280.84;
    return newspeed
  }
  function km2nm(inputspeed){
    var newspeed = inputspeed * 0.539957;
    return newspeed
  }
  //mile to  other distance units
  function mi2cm(inputspeed){
    var newspeed = inputspeed * 160934;
    return newspeed
  }
  function mi2m(inputspeed){
    var newspeed = inputspeed * 1609.34;
    return newspeed
  }
  function mi2km(inputspeed){
    var newspeed = inputspeed * 1.60934;
    return newspeed
  }
  function mi2ft(inputspeed){
    var newspeed = inputspeed * 5280;
    return newspeed
  }
  function mi2nm(inputspeed){
    var newspeed = inputspeed * 0.868976;
    return newspeed
  }
  //feet to  other distance units
  function ft2cm(inputspeed){
    var newspeed = inputspeed * 30.48;
    return newspeed
  }
  function ft2m(inputspeed){
    var newspeed = inputspeed * 0.3048;
    return newspeed
  }
  function ft2km(inputspeed){
    var newspeed = inputspeed * 0.0003048;
    return newspeed
  }
  function ft2mi(inputspeed){
    var newspeed = inputspeed * 0.000189394;
    return newspeed
  }
  function ft2nm(inputspeed){
    var newspeed = inputspeed * 0.000164579;
    return newspeed
  }
  //nautical mile to  other distance units
  function nm2cm(inputspeed){
    var newspeed = inputspeed * 185200;
    return newspeed
  }
  function nm2m(inputspeed){
    var newspeed = inputspeed * 1852;
    return newspeed
  }
  function nm2km(inputspeed){
    var newspeed = inputspeed * 1.852;
    return newspeed
  }
  function nm2mi(inputspeed){
    var newspeed = inputspeed * 1.15078;
    return newspeed
  }
  function nm2ft(inputspeed){
    var newspeed = inputspeed * 6076.12;
    return newspeed
  }

function timestampconversion(){

}

function consorciumbyid(input){

  //use fetch to get info

  var consorciumid = input[0];
  var consorciumnamecolor;

  switch (consorciumid) {
    case 'A':
      consorciumname = {name: 'Intersul', color: 'yellow'};
      break;
    case 'B':
      consorciumname = {name: 'Santa Cruz', color: 'red'};
      break;
    case 'C':
      consorciumname = {name: 'Transcarioca', color: 'blue'};
      break;
    case 'D':
      consorciumname = {name: 'Internorte', color: 'green'};
      break;
    default:
  }
  return consorciumnamecolor
}

function radiusaspolygon(center){

  var radius = 0.8; //800m is a 10min walk
  var options = {steps: 4, units: 'kilometers'}; //what is steps?
  var circle = turf.circle(center, radius, options); //polygon with circle shape

  var circlecoords = turf.getCoords(circle);
  var polygon = L.polyline(circlecoords);
  //polygon.addTo(map);
  return circle
}

function pointsinradiusarea(getpoints, polygon){

  var ptsWithin = turf.pointsWithinPolygon(getpoints, polygon); //turf.points, turf.polygon
  //above returns featureCollection and accepts featureCollection as points
  return ptsWithin
}

function getlayerbycustomid(id){

  var getlayer;
  map.eachLayer( function(layer) {
    if (layer.id == id) {
      getlayer = layer;
    }
  });
  return getlayer
}

async function getbusposition(){
  var getbusroute = 'https://raw.githubusercontent.com/danireload/danireload.github.io/master/bus%20route';
  var busroute = await getpath(getbusroute);
  var getlinefromgeom = busroute.features[0].geometry.coordinates;
  var currentposcoords = getlinefromgeom[c];
  var currentposobj = {coords: currentposcoords};
  var timer;

  if (c == 0) {
    settimer()
    c++
  }else if (c < getlinefromgeom.length -1){
    c++
  }else if (c == getlinefromgeom.length -1){
    console.log('finished');
    settimer();
  }

  return currentposobj
}


function onLocationFound(e) {
  console.log(e);
    var radius = e.accuracy;

    L.marker(e.latlng).addTo(map);
        //.bindPopup("You are within " + radius + " meters from this point").openPopup();

    //L.circle(e.latlng, radius).addTo(map);
    map.flyTo(e.latlng);
}

function onLocationError(e) {
    alert(e.message);
    //request address
}

function movingmarker(array, myIcon){

  var latlngs = array[0];
  var c = array[1];

  var optionsg =   {
      autoStart: false,
      loop: false,
      distance: 10,//828000,  // meters //km/h to m/s: divide speed by 3.6, E.G. 40/3.6 = 11
      interval: 2000,//3600000, // milliseconds
      //icon: smallIcon1,
      onEnd: function() {
        console.log('ended');
      }
  };

  if (c == 2) {
    var myMovingMarker = L.Marker.movingMarker([latlngs[latlngs.length -2], latlngs[latlngs.length -1]], [2000], {autostart: true, loop: false, icon: myIcon}); //, rotationAngle: 0, icon : smallIcon1 //number is total duration of animation
    myMovingMarker.id = 'moving';
    map.addLayer(myMovingMarker);

    //bus id or plate
    var icon = document.getElementsByClassName('fa-plane')[0]; //material-icons
    icon.style.color = "red"; //icon consorcium color
    var iconlabel = document.getElementsByClassName('icon-label')[0];
    iconlabel.innerText = 'Bus';
  }else {
    map.eachLayer(function(layer) {
      if (layer.id == 'moving') {
        layer.moveTo(latlngs[latlngs.length -1], 2000)
      }
    });
  }

  var getturfline1 = turf.lineString([latlngs[latlngs.length -2], latlngs[latlngs.length -1]]);
  //var turfline1 = flipturfcoords(featurecollection);
  var options = {precision: 5, coordinates: 2};
  var truncate = turf.truncate(getturfline1, options);
  var flip = turf.flip(truncate);
  var cleancoords = turf.cleanCoords(flip);
  var length1 = routedistance(cleancoords);

  getbearing(cleancoords)

  //var currentsecond1 = getelapsedtime();
  //var timediff1 = currentsecond1 - previoussecond;
  //var speed1 = (length1 * 100) / timediff1;

  //elapsed time
  //remaining time
  //distance traveled
  //distance remaining
}

function getbearing(turfline){

  var explode = turf.explode(turfline);
  var point1 = turf.point(explode.features[0].geometry.coordinates);
  var point2 = turf.point(explode.features[1].geometry.coordinates);
  var bearing = turf.rhumbBearing(point1, point2);

  if (bearing < 0) { //in order to work, front of icon image must be on right side
    bearing = bearing * -1; //on negative values of bearing is still not right
  }else if (bearing > 0) {
    bearing = 360 - bearing;
  }
  var rotated = document.getElementsByClassName('fa-plane')[0]; //material-icons
  rotated.style.transform = "rotate(" + bearing + "deg)";
}

function turfgreatCircle(startcoords, endcoords){

  var start = flipturfcoords(turf.point(startcoords));
  var end = flipturfcoords(turf.point(endcoords));
  var getgreatCircle = turf.greatCircle(start, end, {npoints: 600});

  var greatCirclecoords = turf.getCoords(getgreatCircle);
  var flipgreatCircle = flipturfcoords(turf.lineString(greatCirclecoords));

  return flipgreatCircle;
}

var timer
function settimer(){

  if (c == 0) {
    timer = setInterval(getaddbuspath, 2000);
  }
  else if (c > 0) {
    clearInterval(timer);
  }
}

async function getpath(url){
  //bus route geojson url

  var a = fetch(url)
  .then(response => response.json())
  .then(data => {
    var geomtoturfgeom = geomtoturf(data);
    return geomtoturfgeom
  })
  .catch(error =>{
    console.log(error);
  })
  return a
}

function routedistance(turfroute){

  var getroutelength = turf.length(turfroute, {units: 'kilometers'});
  var routelength = getroutelength; //.toFixed(2) + 'km'; //toFixed convert number to string
  return routelength;
}

function geomtoturf(geom){
  var feature  = geom.features;
  var features = [];

  for (var i = 0; i < feature.length; i++) {
    var featuretype = feature[i].geometry.type;
    var featurecoords = feature[i].geometry.coordinates;

    var turfgeom = detectgeomtype(featuretype, featurecoords);
    var cleancoords = flipturfcoords(turfgeom);
    features.push(cleancoords);
  }

  var featurecollection = turf.featureCollection(features);
  return featurecollection;
}

function detectgeomtype(featuretype, featurecoords){

  var turfgeom;

  switch (featuretype) {
    case 'LineString':
      turfgeom = turf.lineString(featurecoords);
      break;
    case 'Point':
      turfgeom = turf.point(featurecoords);
      break
    case 'Polygon':
      turfgeom = turf.polygon(featurecoords);
      break;
    default:
  }
  return turfgeom;
}

function flipturfcoords (turfgeom){

  var options = {precision: 5, coordinates: 2};
  var truncate = turf.truncate(turfgeom, options);
  var flip = turf.flip(truncate);
  var cleancoords = turf.cleanCoords(flip);
  return cleancoords;
}

var optionsg =   {
          autoStart: false,
          loop: false,
          distance: 10,//828000,  // meters //km/h to m/s: divide speed by 3.6, E.G. 40/3.6 = 11
          interval: 2000,//3600000, // milliseconds
          //icon: smallIcon1,
          onEnd: function() {
            console.log('ended');
            }
          };

//name funtion below

var i = 0;
var timesRun = 0;
//var interval = setInterval(myMethod, 2000);
var newinterval;

var linetomarker;
var myMovingMarker;
var previouspoint;
var ifmarkermoving;
var previoussecond;

function myMethod() {
  if (i == 0) {
    previouspoint = pointsinline[0];
    previoussecond = getelapsedtime();
    i++
  }else if (i == 1) {
    linetomarker = L.polyline([pointsinline[0], pointsinline[1]], {color: 'green'});
    //markermoto.setLatLng(pointsinline[1]);
    myMovingMarker = L.Marker.movingMarker([pointsinline[0], pointsinline[1]], [2000], {autostart: true, loop: false, icon: myIcon}); //, rotationAngle: 0, icon : smallIcon1 //number is total duration of animation
    map.addLayer(myMovingMarker);
    //newinterval = setInterval(myNewMethod, 200);
    //console.log(myMovingMarker.getLatLng());
    //linetomarker = L.polyline([pointsinline[0], myMovingMarker.getLatLng()], { className: 'my_polyline' });
    //map.setView(myMovingMarker.getLatLng(), 15);

    var turfline1 = turf.lineString([previouspoint, pointsinline[1]]);
    var length1 = turf.length(turfline1, {units: 'kilometers'});
    var currentsecond1 = getelapsedtime();
    var timediff1 = currentsecond1 - previoussecond;
    var speed1 = (length1 * 100) / timediff1;
    console.log((speed1 * 3.6).toFixed(0) + ' km/h');
    previoussecond = currentsecond1;

    //map.addLayer(linetomarker);
    previouspoint = pointsinline[1];
    i++

    //ifmarkermoving = setInterval(ifmarkerstartedmoving, 200);
  }else if (timesRun >= pointsinline.length -2) {
    clearInterval(interval);
    clearInterval(newinterval);
    clearInterval(timeelapsed);
  }else {
    //console.log(pointsinline[i]);
    //markermoto.setLatLng(pointsinline[i]);

    var point1 = turf.point(previouspoint);
    var point2 = turf.point(pointsinline[i]);
    bearing = turf.rhumbBearing(point1, point2);
    //console.log(bearing);
    if (bearing < 0) { //in order to work, front of icon image must be on right side
      bearing = bearing * -1; //on negative values of bearing is still not right
    }else if (bearing > 0) {
      bearing = 360 - bearing;
    }
    var rotated = document.getElementsByClassName('fa-plane')[0]; //material-icons
    rotated.style.transform = "rotate(" + bearing + "deg)";
    myMovingMarker.addLatLng(pointsinline[i], 2000);

    var turfline2 = turf.lineString([point1.geometry.coordinates, point2.geometry.coordinates]);
    var length2 = turf.length(turfline2, {units: 'kilometers'});
    var currentsecond2 = getelapsedtime();
    var timediff2 = currentsecond2 - previoussecond;
    previoussecond = currentsecond2;
    var speed2 = (length2 * 100) / timediff2;
    console.log((speed2 * 3.6).toFixed(0) + ' km/h');

    previouspoint = pointsinline[i];
    i++
    timesRun += 1;
  }
}
var timeelapsed;

function ifmarkerstartedmoving(){
  if (myMovingMarker.isStarted() == true) {
    //timeelapsed = setInterval(getelapsedtime, 1000);
    clearInterval(ifmarkermoving);
  }
}
var sec = 0;
function pad ( val ) { return val > 9 ? val : "0" + val; }

function getelapsedtime(){
    document.getElementById("seconds").innerHTML=pad(++sec%60);
    document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10));
    return pad(sec);
}

var executed = false;

function myNewMethod(){
  //var markerposition = markermoto.getLatLng(pointsinline[i]);
  //linetomarker.addLatLng(markerposition);
  if (myMovingMarker.isRunning() == true) {
    var markerposition = myMovingMarker.getLatLng();
    linetomarker.addLatLng(markerposition);

    var linelatlngs = linetomarker.getLatLngs().map(function(point) {
        return [point.lat, point.lng]; //cover objects to array of number
    });
    var turfline = turf.lineString(linelatlngs);
    var length = turf.length(turfline, {units: 'kilometers'});
    var textholder = document.getElementById('track-info').getElementsByTagName('p');
    textholder[2].innerText = 'Distance from Start: ' + length.toFixed(2) + 'km'; //toFixed convert number to string

    var start = turf.point(Object.values(markerposition));
    //var coordstodest = pathtodestination.getLatLngs();
    var stop = turf.point(pointsinline[pointsinline.length - 1]);
    var sliced = turf.lineSlice(start, stop, turflinetodest);
    pathtodestination.setLatLngs(sliced.geometry.coordinates);
    var length = turf.length(sliced, {units: 'kilometers'});

if (executed == false) {
    neardestination(length);
}

    textholder[0].innerText = 'Distance to Destination: ' + length.toFixed(2) + 'km'; //toFixed convert number to string
    var walktime = (length * 1000)/1.4;
    textholder[1].innerText = 'walking time: ' + (walktime / 60).toFixed(0) + 'min'; //walk rithim = 1.4 metres per second
  }
}

function neardestination(length){
  if (length <= 0.3) {
    console.log("Near Destination!"); //must say only once
    executed = true;
  }
}

//to do: multiple colored lines on polyline, use leaflet routing machine, add snaptoline, warn if near start point

  function degrees_to_radians(degrees){
    var pi = Math.PI;
    return degrees * (pi/180);
  }
  function radians_to_degrees(radians){
    var pi = Math.PI;
    return radians * (180/pi);
  }

  animatepolygon()
  function animatepolygon(){

    var gigfeatureCollection = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-43.23351860046387,-22.823418689496965],[-43.240127563476555,-22.82017511840949],[-43.23841094970703,-22.818276406798535],[-43.24441909790038,-22.814478904157756],[-43.24587821960449,-22.81519094396842],[-43.24742317199707,-22.81463713554848],[-43.24725151062012,-22.813371279275767],[-43.24991226196289,-22.811472472809275],[-43.25111389160156,-22.811868059672484],[-43.25274467468262,-22.811156002491604],[-43.25240135192871,-22.80965275844273],[-43.25523376464844,-22.808465975108554],[-43.25446128845215,-22.80720006149094],[-43.25334548950195,-22.80720006149094],[-43.252315521240234,-22.806250618559172],[-43.23454856872558,-22.802294535135648],[-43.23317527770996,-22.802927516201052],[-43.23257446289062,-22.805142926777332],[-43.231544494628906,-22.804905563081164],[-43.22836875915527,-22.810602177666592],[-43.22502136230469,-22.80585501538506],[-43.222360610961914,-22.80458907750977],[-43.22004318237305,-22.799366959467555],[-43.21369171142578,-22.797072329176512],[-43.212318420410156,-22.79509416861396],[-43.211202621459954,-22.79469853305704],[-43.213090896606445,-22.78971342667588],[-43.21420669555664,-22.78971342667588],[-43.21849822998047,-22.79018820656433],[-43.21995735168457,-22.79010907669772],[-43.22321891784668,-22.79097950270505],[-43.224077224731445,-22.791929052012705],[-43.24536323547363,-22.797626208990213],[-43.245792388916016,-22.79715145500196],[-43.24690818786621,-22.797388832202763],[-43.24716567993164,-22.797942710730464],[-43.25068473815918,-22.79912958571147],[-43.25111389160156,-22.79841746196298],[-43.25763702392578,-22.79968345716596],[-43.261070251464844,-22.803085761008028],[-43.26072692871094,-22.8041934695119],[-43.26441764831543,-22.809257165146672],[-43.26579093933105,-22.811709825065066],[-43.26536178588867,-22.813925092842634],[-43.26132774353027,-22.816852355716975],[-43.250341415405266,-22.824051572406812],[-43.2505989074707,-22.826820400544044],[-43.246564865112305,-22.83045934615899],[-43.24562072753906,-22.830142919967674],[-43.23892593383789,-22.83259520370734],[-43.23351860046387,-22.823418689496965]]]}}]};

    var getturfpolygon = turf.polygon(gigfeatureCollection.features[0].geometry.coordinates);
    var turfpolygon = flipturfcoords(getturfpolygon);
    var getpolygon2line = turf.polygonToLine(turfpolygon);
    //var polygon2line = flipturfcoords(getpolygon2line);
    var polygon2linecoords = turf.getCoords(getpolygon2line);

    var numofparts = polygon2linecoords.length;
    var totalduration = 5000;
    var speed = totalduration/numofparts;

    var line = L.polyline([polygon2linecoords[0], polygon2linecoords[1]], {color: 'yellow', weight: '3',  dashArray: '4, 4', dashOffset: '0'}); //dashArray: '4, 10' (size, distance)
    //weight: '4',  dashArray: '1, 7' //looks dotted

    var polygon = L.polygon(turf.getCoords(turfpolygon), {color: 'rgba(255, 255, 255, 0)', fillColor: 'black', fillOpacity: 0.5});
    var polygontooltipoffset = getpolygontopcenter(turfpolygon);
    polygon.bindTooltip("Galeão", {permanent: 'true', direction: 'top', offset: polygontooltipoffset, className: 'locationtooltipstyle'}).openTooltip();
    //if tooltip is of the polygon, add marker inside the polygon without image and open popup?
    //hack tooltip to appear at the top of the polygon, not to obstruct it?
    //how to calculate top offset based on polygon size?
    polygon.addTo(map);

    var setlocationtooltipstyle = document.getElementsByClassName('locationtooltipstyle')[0];
    setlocationtooltipstyle.style.backgroundColor = "purple";
    setlocationtooltipstyle.style.border = "none";
    setlocationtooltipstyle.style.boxShadow = "none";
    setlocationtooltipstyle.style.fontSize = "16px";
    setlocationtooltipstyle.style.color = "white";
    setlocationtooltipstyle.style.fontWeight = "bold";

    //use turf method for square ready

      var leafletbbox = getbboxtopolybbox(turfpolygon);
      var bbox = L.polygon(turf.getCoords(leafletbbox));
      //bbox.addTo(map);
    //or use leaflet method to add missing points to square like in bbox function
      var polycenter = polygon.getCenter();
      var polybounds  = polygon.getBounds();
      //L.marker([polybounds['_northEast']['lat'], polybounds['_northEast']['lng']]).addTo(map);
      //L.marker([polybounds['_southWest']['lat'], polybounds['_southWest']['lng']]).addTo(map);
    //final results are the same

    var getanimatedpolygoncoords = turf.getCoords(turfpolygon);
    var animatedpolygon = L.polygon([getanimatedpolygoncoords[0][0], getanimatedpolygoncoords[0][1], getanimatedpolygoncoords[0][0]], {color: 'rgba(255, 255, 255, 0)', fillColor: 'black', fillOpacity: 0.5});
    //animatedpolygon.addTo(map);

    line.addTo(map);

    var d = 2;
    var timeout = setInterval(() => {
      if (d < polygon2linecoords.length) {
        line.addLatLng(polygon2linecoords[d]);
        //animatedpolygon.addLatLng(polygon2linecoords[d]); //goes outside of polygon area on movment depending on polygon final shape, as expected
        d++
      }else {
        clearInterval(timeout);
      }
    }, speed);

  }

  //educatedguessdistancetouser()
  function educatedguessdistancetouser(driverpoint, userpoint){

    var driverpoint = turf.point([-43.1982421875,-22.91792293614603]);
    var userpoint = turf.point([-43.254547119140625, -22.802294535135648]);

    var turfbboxpoly = getbboxtopolybbox(turf.featureCollection([driverpoint, userpoint]));

    var leafletbboxpolycoords = turf.getCoords(flipturfcoords(turfbboxpoly));
    //L.polygon(leafletbboxpolycoords).addTo(map);
    var bboxlength = turf.length(turfbboxpoly, {units: 'kilometers'});
    console.log(bboxlength.toFixed(2) + 'km');

    //or use triangle depending on anlge between points:
    var triangle = L.polygon([leafletbboxpolycoords[0][0], leafletbboxpolycoords[0][1], leafletbboxpolycoords[0][3], leafletbboxpolycoords[0][0]]);

    var getdistance1 = turf.lineString([leafletbboxpolycoords[0][3], leafletbboxpolycoords[0][0], leafletbboxpolycoords[0][1]]);
    //above is traingle base and height
    var getdistance2 = turf.lineString([leafletbboxpolycoords[0][3], leafletbboxpolycoords[0][1]]);
    //above is traingle hipotenuse

    var tiranglepartlength = turf.length(turfbboxpoly, {units: 'kilometers'});

    //distance2.addTo(map);

  }

  function getbboxtopolybbox(turffeature){

    //var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
    var bbox = turf.bbox(turffeature);
    var bboxPolygon = turf.bboxPolygon(bbox);
    return bboxPolygon
  }

  function getpolygontopcenter(polygon){

    var centercoords = turf.center(polygon);

    var bbox = turf.bbox(polygon);
    var bboxPolygon = turf.bboxPolygon(bbox);

    var gettopline = turf.getCoords(bboxPolygon);
    var topline  = turf.lineString([gettopline[0][1], gettopline[0][2]]);
    var topcentercoords  = turf.center(topline);

    var getcenterpixels = new L.latLng(turf.getCoords(centercoords));
    var centerpixels = map.latLngToLayerPoint(getcenterpixels);
    var gettopcenterpixels = new L.latLng(turf.getCoords(topcentercoords));
    var topcenterpixels = map.latLngToLayerPoint(gettopcenterpixels);

    var getoffset = centerpixels.distanceTo(topcenterpixels);
    var offset = [0, getoffset*-1]

    return offset

  }

  function addpieceofpolygon(id, coord, i, length, timeout){
    if (i < length - 1 ) {
      var layer = getlayerbycustomid(id);
      layer.addLatLng(coord);
    }
  }

  //statepolygonwithlocationhole()
  function statepolygonwithlocationhole(){

    var jacarepaguairportfeatureCollection = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-43.373894691467285,-22.981745227167494],[-43.37423801422119,-22.99280732866982],[-43.368186950683594,-22.990594980853423],[-43.36801528930664,-22.988303582405518],[-43.366684913635254,-22.988303582405518],[-43.366641998291016,-22.98692082315402],[-43.368144035339355,-22.98664426960494],[-43.368229866027825,-22.986012145080725],[-43.36934566497803,-22.986012145080725],[-43.369131088256836,-22.9820217907465],[-43.373894691467285,-22.981745227167494]]]}}]};

    var riostatefeaturecollection = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-44.2315,-23.0753],[-44.2377,-23.0928],[-44.2528,-23.0974],[-44.2495,-23.1094],[-44.2583,-23.1157],[-44.2726,-23.1174],[-44.282,-23.1348],[-44.2973,-23.1314],[-44.2941,-23.1227],[-44.2966,-23.1166],[-44.3062,-23.1212],[-44.3133,-23.1333],[-44.3204,-23.1367],[-44.3201,-23.1437],[-44.3251,-23.1541],[-44.3442,-23.156],[-44.3549,-23.1596],[-44.3624,-23.166],[-44.3684,-23.165],[-44.3776,-23.1724],[-44.3735,-23.1831],[-44.3621,-23.1835],[-44.3552,-23.1911],[-44.346,-23.1809],[-44.3395,-23.1903],[-44.3485,-23.2036],[-44.3512,-23.2142],[-44.3448,-23.2185],[-44.3453,-23.2252],[-44.3334,-23.2236],[-44.3293,-23.2073],[-44.3222,-23.2027],[-44.3113,-23.1805],[-44.2886,-23.1766],[-44.2717,-23.1798],[-44.2626,-23.1925],[-44.2566,-23.1889],[-44.2468,-23.2011],[-44.2307,-23.1997],[-44.2266,-23.1957],[-44.2067,-23.1926],[-44.1927,-23.1987],[-44.1882,-23.1825],[-44.1778,-23.1797],[-44.1702,-23.1845],[-44.1591,-23.172],[-44.14,-23.167],[-44.1313,-23.1692],[-44.1234,-23.1765],[-44.1299,-23.1841],[-44.1185,-23.1861],[-44.1088,-23.1785],[-44.0945,-23.1748],[-44.0913,-23.1659],[-44.1078,-23.1618],[-44.1206,-23.153],[-44.1377,-23.1597],[-44.1405,-23.1389],[-44.1271,-23.1253],[-44.1269,-23.1195],[-44.148,-23.1249],[-44.1555,-23.1388],[-44.164,-23.142],[-44.1699,-23.1376],[-44.1726,-23.1287],[-44.1687,-23.1199],[-44.1764,-23.1171],[-44.186,-23.1209],[-44.2017,-23.1197],[-44.2069,-23.1033],[-44.1952,-23.1064],[-44.1947,-23.0986],[-44.2075,-23.0977],[-44.2163,-23.0898],[-44.2334,-23.0907],[-44.2315,-23.0753]]],[[[-44.372,-23.0368],[-44.3743,-23.0314],[-44.3907,-23.042],[-44.3814,-23.0462],[-44.3748,-23.0439],[-44.3619,-23.0463],[-44.358,-23.0588],[-44.3515,-23.0539],[-44.3478,-23.0428],[-44.3521,-23.037],[-44.364,-23.041],[-44.372,-23.0368]]],[[[-44.1657,-23.0339],[-44.1536,-23.038],[-44.13,-23.0325],[-44.1244,-23.0263],[-44.1133,-23.0232],[-44.1043,-23.0111],[-44.0957,-23.0043],[-44.097,-22.9969],[-44.0852,-22.9923],[-44.0776,-22.9788],[-44.0762,-22.9707],[-44.0813,-22.9595],[-44.0743,-22.952],[-44.0617,-22.9489],[-44.0473,-22.942],[-44.04,-22.9525],[-44.0418,-22.9619],[-44.0551,-22.9793],[-44.0478,-22.9843],[-44.0325,-22.9804],[-44.0305,-22.9643],[-44.0113,-22.949],[-44.0059,-22.9421],[-43.9909,-22.9403],[-43.9764,-22.9314],[-43.9658,-22.9345],[-43.9496,-22.9269],[-43.94,-22.9304],[-43.9319,-22.9289],[-43.9105,-22.931],[-43.8941,-22.9226],[-43.882,-22.9209],[-43.8806,-22.9158],[-43.8709,-22.9053],[-43.8457,-22.9017],[-43.839,-22.911],[-43.852,-22.9242],[-43.8423,-22.9322],[-43.832,-22.9312],[-43.8102,-22.9176],[-43.8028,-22.9248],[-43.796,-22.9171],[-43.7897,-22.9258],[-43.7843,-22.9243],[-43.7757,-22.9318],[-43.7453,-22.9465],[-43.7316,-22.9579],[-43.7247,-22.9607],[-43.7165,-22.9706],[-43.711,-22.9706],[-43.7001,-22.9861],[-43.691,-22.9893],[-43.6808,-22.9814],[-43.6745,-22.9803],[-43.664,-22.9869],[-43.6542,-23],[-43.6432,-23.0011],[-43.6388,-23.006],[-43.6278,-23.0066],[-43.6141,-23.0176],[-43.5996,-23.0229],[-43.5943,-23.0324],[-43.5797,-23.0396],[-43.5786,-23.0451],[-43.5624,-23.0532],[-43.5687,-23.0655],[-43.5664,-23.0752],[-43.5544,-23.074],[-43.5489,-23.0607],[-43.5421,-23.0591],[-43.5322,-23.0497],[-43.508,-23.0473],[-43.5074,-23.0429],[-43.4928,-23.0353],[-43.4677,-23.0299],[-43.4544,-23.0252],[-43.4198,-23.0176],[-43.3879,-23.0131],[-43.3576,-23.0111],[-43.3359,-23.0114],[-43.3028,-23.0163],[-43.2874,-23.0111],[-43.2747,-23.0023],[-43.2521,-22.9991],[-43.2457,-23.001],[-43.232,-22.9953],[-43.231,-22.9908],[-43.2176,-22.987],[-43.1982,-22.9879],[-43.1882,-22.9858],[-43.1853,-22.9742],[-43.1592,-22.9589],[-43.1502,-22.9507],[-43.1558,-22.9433],[-43.1625,-22.9438],[-43.17,-22.9523],[-43.1801,-22.9485],[-43.1686,-22.9387],[-43.1713,-22.9324],[-43.1626,-22.9172],[-43.1615,-22.9053],[-43.1692,-22.9046],[-43.1811,-22.8954],[-43.1962,-22.8921],[-43.2108,-22.8976],[-43.2161,-22.8867],[-43.2014,-22.8715],[-43.2099,-22.867],[-43.2134,-22.8731],[-43.2257,-22.8741],[-43.2365,-22.862],[-43.245,-22.8406],[-43.2549,-22.8365],[-43.2669,-22.8235],[-43.2728,-22.8098],[-43.2713,-22.7948],[-43.2772,-22.7873],[-43.2774,-22.78],[-43.2579,-22.7564],[-43.2446,-22.7511],[-43.2387,-22.7431],[-43.2255,-22.7412],[-43.2132,-22.7343],[-43.2146,-22.7277],[-43.1949,-22.7221],[-43.1803,-22.72],[-43.161,-22.7099],[-43.1425,-22.7084],[-43.1347,-22.7145],[-43.1247,-22.7137],[-43.1174,-22.7069],[-43.1157,-22.6964],[-43.1076,-22.6937],[-43.1004,-22.686],[-43.0929,-22.6859],[-43.0809,-22.6797],[-43.0664,-22.6868],[-43.0572,-22.6852],[-43.0513,-22.6927],[-43.0389,-22.6926],[-43.0332,-22.7183],[-43.0259,-22.7261],[-43.0266,-22.7431],[-43.0466,-22.7572],[-43.0643,-22.7651],[-43.0684,-22.7786],[-43.0814,-22.7898],[-43.0791,-22.7989],[-43.0651,-22.8029],[-43.0828,-22.8206],[-43.0969,-22.8279],[-43.0954,-22.8343],[-43.1034,-22.8559],[-43.109,-22.8646],[-43.1153,-22.8645],[-43.1342,-22.8813],[-43.1249,-22.895],[-43.1357,-22.8977],[-43.1312,-22.9084],[-43.1159,-22.9048],[-43.1104,-22.9111],[-43.1005,-22.9141],[-43.0948,-22.9206],[-43.0986,-22.9316],[-43.1119,-22.9353],[-43.1198,-22.926],[-43.1312,-22.9392],[-43.1156,-22.9391],[-43.1104,-22.9536],[-43.1013,-22.9527],[-43.0725,-22.9568],[-43.0544,-22.9625],[-43.0398,-22.9745],[-43.0138,-22.9768],[-43.0129,-22.9711],[-43.0015,-22.9696],[-42.9668,-22.97],[-42.9211,-22.9749],[-42.9098,-22.9741],[-42.8812,-22.967],[-42.8328,-22.9626],[-42.7763,-22.9599],[-42.7275,-22.9562],[-42.7116,-22.9561],[-42.6839,-22.9592],[-42.6818,-22.9472],[-42.6694,-22.9423],[-42.6412,-22.9375],[-42.6123,-22.9344],[-42.5788,-22.9328],[-42.5185,-22.9334],[-42.4746,-22.9378],[-42.4558,-22.9349],[-42.3816,-22.9357],[-42.3548,-22.9356],[-42.2812,-22.9395],[-42.2004,-22.9435],[-42.135,-22.9487],[-42.0739,-22.9555],[-42.0479,-22.962],[-42.0379,-22.9672],[-42.0293,-22.9828],[-42.0197,-22.9841],[-42.0153,-22.9917],[-42.008,-22.9841],[-42.0199,-22.9714],[-42.0071,-22.9622],[-42.0107,-22.9523],[-42.018,-22.9601],[-42.0268,-22.9563],[-42.0239,-22.9479],[-42.0337,-22.9452],[-42.0373,-22.9331],[-42.0373,-22.9217],[-42.0331,-22.9065],[-42.0204,-22.8888],[-42.0097,-22.8828],[-42.0042,-22.8896],[-41.9898,-22.8827],[-41.9818,-22.867],[-41.9866,-22.8584],[-41.9858,-22.8505],[-41.9766,-22.8302],[-41.9694,-22.8228],[-41.9403,-22.8094],[-41.9332,-22.8098],[-41.9282,-22.7959],[-41.9218,-22.7871],[-41.908,-22.7782],[-41.8964,-22.7858],[-41.8837,-22.7818],[-41.8768,-22.7695],[-41.8662,-22.7619],[-41.8739,-22.751],[-41.8683,-22.7427],[-41.8806,-22.74],[-41.8859,-22.7544],[-41.8957,-22.7537],[-41.9053,-22.757],[-41.9106,-22.7684],[-41.9224,-22.7712],[-41.9332,-22.7667],[-41.9456,-22.7543],[-41.9594,-22.7325],[-41.9735,-22.7296],[-41.9813,-22.723],[-41.9876,-22.7112],[-41.9942,-22.6883],[-41.9975,-22.6678],[-41.9997,-22.6326],[-41.9979,-22.6095],[-41.9914,-22.5981],[-41.9792,-22.5625],[-41.9693,-22.5431],[-41.9617,-22.5345],[-41.9467,-22.5284],[-41.9327,-22.5375],[-41.9239,-22.5302],[-41.9126,-22.5111],[-41.8972,-22.4922],[-41.8896,-22.4861],[-41.8767,-22.4878],[-41.8644,-22.477],[-41.8547,-22.4498],[-41.8391,-22.4326],[-41.8178,-22.417],[-41.795,-22.4046],[-41.7744,-22.3911],[-41.7665,-22.3782],[-41.7761,-22.3743],[-41.7735,-22.3641],[-41.7618,-22.3514],[-41.7392,-22.3391],[-41.7126,-22.3166],[-41.6891,-22.3],[-41.6582,-22.2831],[-41.6095,-22.2618],[-41.5424,-22.2346],[-41.5188,-22.2244],[-41.4938,-22.2154],[-41.4513,-22.2024],[-41.3866,-22.1855],[-41.3544,-22.1764],[-41.318,-22.1678],[-41.2646,-22.1537],[-41.2158,-22.1374],[-41.1674,-22.1158],[-41.1457,-22.1042],[-41.1338,-22.0955],[-41.1311,-22.0893],[-41.0769,-22.0578],[-41.0459,-22.042],[-41.0256,-22.0327],[-41.004,-22.0211],[-40.9908,-22.0103],[-40.9804,-21.9906],[-40.9751,-21.9666],[-40.9752,-21.941],[-40.9818,-21.9111],[-40.9889,-21.8857],[-40.9947,-21.8543],[-40.9991,-21.8412],[-41.0183,-21.7614],[-41.023,-21.7387],[-41.0248,-21.7186],[-41.0223,-21.6828],[-41.0155,-21.6445],[-41.0131,-21.6235],[-41.0245,-21.6233],[-41.0481,-21.6178],[-41.046,-21.6066],[-41.0653,-21.554],[-41.0646,-21.5492],[-41.0726,-21.5256],[-41.0729,-21.5121],[-41.0689,-21.4976],[-41.0573,-21.4789],[-41.0206,-21.4418],[-41.0058,-21.4184],[-41.0008,-21.4041],[-40.9917,-21.394],[-40.9826,-21.3916],[-40.9698,-21.3757],[-40.9614,-21.3605],[-40.9643,-21.3492],[-40.9631,-21.3278],[-40.9579,-21.3114],[-40.961,-21.3011],[-40.9647,-21.2963],[-40.977,-21.2904],[-40.995,-21.2864],[-40.9993,-21.2785],[-40.9982,-21.2673],[-41.0049,-21.2528],[-41.0154,-21.2519],[-41.0244,-21.2458],[-41.0399,-21.2551],[-41.0593,-21.2346],[-41.0895,-21.2196],[-41.1054,-21.2196],[-41.1156,-21.2286],[-41.1273,-21.2298],[-41.1371,-21.2274],[-41.1403,-21.2376],[-41.1756,-21.2447],[-41.1832,-21.2394],[-41.1904,-21.2486],[-41.2131,-21.2359],[-41.2221,-21.2329],[-41.2414,-21.2204],[-41.2565,-21.2253],[-41.2609,-21.2332],[-41.2685,-21.2327],[-41.2762,-21.2401],[-41.2826,-21.2348],[-41.3035,-21.2286],[-41.3162,-21.2135],[-41.3258,-21.2186],[-41.3327,-21.2155],[-41.3383,-21.2068],[-41.3699,-21.2042],[-41.3885,-21.1991],[-41.4031,-21.1983],[-41.4165,-21.2001],[-41.4352,-21.2157],[-41.4462,-21.2155],[-41.4696,-21.2028],[-41.4791,-21.1936],[-41.4865,-21.1799],[-41.5024,-21.1826],[-41.5116,-21.1758],[-41.5201,-21.1873],[-41.5304,-21.18],[-41.5487,-21.183],[-41.5577,-21.1733],[-41.5646,-21.1837],[-41.5698,-21.1724],[-41.5786,-21.1696],[-41.5861,-21.1597],[-41.5891,-21.1496],[-41.6126,-21.157],[-41.622,-21.147],[-41.6455,-21.1434],[-41.6654,-21.132],[-41.6639,-21.1248],[-41.6887,-21.1218],[-41.6956,-21.1155],[-41.7054,-21.1205],[-41.7049,-21.1278],[-41.7171,-21.1253],[-41.718,-21.1161],[-41.7106,-21.1111],[-41.7169,-21.1051],[-41.7263,-21.1068],[-41.7359,-21.1026],[-41.7313,-21.0873],[-41.7216,-21.0733],[-41.7235,-21.067],[-41.7326,-21.0664],[-41.7162,-21.0468],[-41.7218,-21.043],[-41.7252,-21.0329],[-41.7232,-21.0259],[-41.7154,-21.0223],[-41.7145,-21.0154],[-41.7224,-21.0092],[-41.7156,-20.9913],[-41.7101,-20.9908],[-41.718,-20.965],[-41.7173,-20.9532],[-41.7259,-20.9506],[-41.7338,-20.9433],[-41.7373,-20.9279],[-41.7221,-20.9201],[-41.7184,-20.9008],[-41.7263,-20.8924],[-41.7124,-20.8681],[-41.725,-20.8657],[-41.7415,-20.8726],[-41.739,-20.8664],[-41.7439,-20.8546],[-41.7416,-20.8415],[-41.7363,-20.8359],[-41.7426,-20.8256],[-41.7399,-20.8175],[-41.7551,-20.8068],[-41.7752,-20.7999],[-41.794,-20.7981],[-41.7992,-20.8053],[-41.817,-20.8013],[-41.8288,-20.7943],[-41.8255,-20.7885],[-41.8355,-20.7803],[-41.8446,-20.7773],[-41.852,-20.764],[-41.8747,-20.7659],[-41.8847,-20.7834],[-41.8962,-20.7884],[-41.905,-20.7974],[-41.9155,-20.7927],[-41.9282,-20.794],[-41.9262,-20.8023],[-41.9297,-20.8081],[-41.9325,-20.8257],[-41.9267,-20.8388],[-41.9297,-20.8436],[-41.937,-20.8561],[-41.9505,-20.8588],[-41.9545,-20.8656],[-41.9496,-20.8721],[-41.9602,-20.883],[-41.9598,-20.8898],[-41.965,-20.8974],[-41.9637,-20.9065],[-41.9667,-20.917],[-41.9735,-20.917],[-41.9786,-20.9349],[-42.0003,-20.9272],[-42.0172,-20.9291],[-42.0385,-20.9275],[-42.0478,-20.9347],[-42.0677,-20.9392],[-42.073,-20.9365],[-42.0863,-20.9397],[-42.0938,-20.9356],[-42.1013,-20.9435],[-42.1149,-20.9516],[-42.1148,-20.9584],[-42.1269,-20.9561],[-42.138,-20.96],[-42.1509,-20.974],[-42.1502,-20.9807],[-42.141,-20.993],[-42.127,-21.0008],[-42.1201,-21.0001],[-42.114,-21.0122],[-42.1027,-21.014],[-42.0848,-21.023],[-42.0801,-21.0302],[-42.0804,-21.0359],[-42.0949,-21.0372],[-42.1037,-21.0459],[-42.1046,-21.0547],[-42.1205,-21.0692],[-42.1185,-21.0748],[-42.1312,-21.0793],[-42.1314,-21.0871],[-42.1397,-21.1029],[-42.1517,-21.1041],[-42.1637,-21.1007],[-42.1745,-21.1318],[-42.1818,-21.1434],[-42.1901,-21.1462],[-42.1953,-21.1603],[-42.2001,-21.1727],[-42.2083,-21.179],[-42.1947,-21.2027],[-42.2017,-21.2073],[-42.2026,-21.2212],[-42.1915,-21.2236],[-42.1891,-21.2333],[-42.195,-21.2391],[-42.1897,-21.2505],[-42.1998,-21.2564],[-42.2136,-21.2725],[-42.2197,-21.2722],[-42.2287,-21.2825],[-42.2292,-21.307],[-42.2378,-21.318],[-42.2371,-21.3241],[-42.2289,-21.3286],[-42.2242,-21.3378],[-42.2356,-21.3429],[-42.2299,-21.3594],[-42.23,-21.3665],[-42.2424,-21.3729],[-42.2406,-21.3771],[-42.252,-21.3872],[-42.2367,-21.3937],[-42.2383,-21.4035],[-42.2601,-21.4097],[-42.2679,-21.3996],[-42.2753,-21.4042],[-42.2782,-21.414],[-42.2754,-21.4275],[-42.2861,-21.4423],[-42.2839,-21.4458],[-42.2921,-21.4592],[-42.2681,-21.4689],[-42.2715,-21.4746],[-42.2574,-21.4823],[-42.2546,-21.487],[-42.2597,-21.4963],[-42.2737,-21.5038],[-42.2856,-21.5281],[-42.2969,-21.5236],[-42.3064,-21.5295],[-42.3025,-21.5387],[-42.3143,-21.5556],[-42.3309,-21.5605],[-42.3249,-21.5695],[-42.346,-21.5827],[-42.3527,-21.5917],[-42.363,-21.605],[-42.3687,-21.6184],[-42.3586,-21.6308],[-42.3647,-21.6322],[-42.3696,-21.6401],[-42.3652,-21.6465],[-42.3463,-21.6518],[-42.3397,-21.6603],[-42.331,-21.6606],[-42.3017,-21.655],[-42.2879,-21.6677],[-42.2821,-21.6809],[-42.2733,-21.6779],[-42.2653,-21.6935],[-42.2727,-21.7037],[-42.2666,-21.7145],[-42.3066,-21.7284],[-42.3141,-21.7378],[-42.3335,-21.7458],[-42.3526,-21.744],[-42.3577,-21.7411],[-42.3777,-21.7484],[-42.3937,-21.7574],[-42.3956,-21.7616],[-42.4299,-21.7757],[-42.4383,-21.7761],[-42.4597,-21.7848],[-42.4632,-21.7862],[-42.4879,-21.7978],[-42.6008,-21.845],[-42.606,-21.8464],[-42.6143,-21.8559],[-42.6265,-21.8587],[-42.6403,-21.8658],[-42.6653,-21.8733],[-42.685,-21.8792],[-42.74,-21.9087],[-42.7878,-21.9296],[-42.8103,-21.9378],[-42.8155,-21.9364],[-42.8357,-21.9442],[-42.867,-21.9533],[-42.8814,-21.9593],[-42.8785,-21.9658],[-42.8936,-21.9752],[-42.8969,-21.9822],[-42.9096,-21.9907],[-42.9377,-22.0034],[-42.9471,-22.0059],[-42.9592,-22.015],[-42.969,-22.0149],[-42.9843,-22.026],[-42.9878,-22.0319],[-42.9969,-22.0361],[-43.0022,-22.0328],[-43.0079,-22.0315],[-43.0267,-22.0427],[-43.0392,-22.0446],[-43.0389,-22.053],[-43.0332,-22.0659],[-43.0531,-22.0817],[-43.0755,-22.0929],[-43.0781,-22.0831],[-43.0897,-22.0879],[-43.1062,-22.0827],[-43.1222,-22.0894],[-43.1265,-22.1038],[-43.1356,-22.1099],[-43.1423,-22.1044],[-43.1497,-22.0806],[-43.1532,-22.0744],[-43.1332,-22.0579],[-43.1276,-22.0467],[-43.1306,-22.035],[-43.1312,-22.0292],[-43.1422,-22.0334],[-43.1536,-22.033],[-43.1634,-22.0285],[-43.1696,-22.0218],[-43.1793,-22.0292],[-43.202,-22.0375],[-43.2075,-22.0297],[-43.2215,-22.0338],[-43.2277,-22.0288],[-43.2367,-22.0229],[-43.2342,-22.0142],[-43.2466,-22.0066],[-43.2548,-22.012],[-43.2615,-22.008],[-43.2675,-22.012],[-43.2805,-22.011],[-43.3022,-22.021],[-43.3162,-22.0077],[-43.3266,-22.0078],[-43.3414,-22.009],[-43.3467,-22.0038],[-43.3504,-22.008],[-43.365,-22.0105],[-43.3678,-22.0198],[-43.3828,-22.0302],[-43.4047,-22.0424],[-43.4228,-22.0552],[-43.437,-22.06],[-43.4645,-22.0728],[-43.4768,-22.0694],[-43.4821,-22.0729],[-43.5045,-22.075],[-43.5048,-22.0664],[-43.5121,-22.0592],[-43.5181,-22.0608],[-43.5257,-22.0727],[-43.5418,-22.0794],[-43.5477,-22.0789],[-43.5661,-22.0875],[-43.5694,-22.077],[-43.5747,-22.0782],[-43.5914,-22.0558],[-43.603,-22.0723],[-43.6118,-22.0721],[-43.6119,-22.0815],[-43.6212,-22.0833],[-43.636,-22.0691],[-43.6457,-22.0649],[-43.6639,-22.0735],[-43.6684,-22.0861],[-43.673,-22.0904],[-43.6802,-22.0805],[-43.6821,-22.0716],[-43.6929,-22.0714],[-43.6957,-22.0765],[-43.7089,-22.0758],[-43.7193,-22.0804],[-43.7314,-22.0962],[-43.7523,-22.0877],[-43.7612,-22.0794],[-43.7682,-22.0676],[-43.7765,-22.066],[-43.789,-22.073],[-43.7995,-22.0826],[-43.8098,-22.082],[-43.8243,-22.0908],[-43.8312,-22.0913],[-43.8416,-22.0991],[-43.8584,-22.0952],[-43.8636,-22.1004],[-43.8806,-22.1014],[-43.8797,-22.114],[-43.8922,-22.1136],[-43.9205,-22.1253],[-43.9287,-22.1306],[-43.9426,-22.1325],[-43.9535,-22.1423],[-43.9649,-22.1394],[-43.9771,-22.1464],[-43.998,-22.1559],[-44.0047,-22.1627],[-44.0146,-22.1537],[-44.0335,-22.1523],[-44.0486,-22.1622],[-44.0604,-22.1602],[-44.072,-22.1646],[-44.0763,-22.1754],[-44.084,-22.1754],[-44.0871,-22.1823],[-44.1013,-22.1737],[-44.1125,-22.1886],[-44.1214,-22.1909],[-44.125,-22.1993],[-44.1217,-22.2091],[-44.1384,-22.2155],[-44.1456,-22.2136],[-44.152,-22.2186],[-44.1544,-22.2272],[-44.1744,-22.2304],[-44.1794,-22.2285],[-44.1892,-22.2404],[-44.2083,-22.2509],[-44.2141,-22.2484],[-44.2221,-22.2527],[-44.2235,-22.2595],[-44.2368,-22.2658],[-44.2472,-22.2673],[-44.2504,-22.2605],[-44.2599,-22.268],[-44.2627,-22.2441],[-44.2915,-22.2431],[-44.3023,-22.2539],[-44.3153,-22.2543],[-44.3172,-22.2595],[-44.345,-22.2534],[-44.3524,-22.2577],[-44.3596,-22.254],[-44.3747,-22.2611],[-44.3769,-22.2683],[-44.39,-22.2705],[-44.3948,-22.2589],[-44.4332,-22.2514],[-44.4388,-22.2557],[-44.4571,-22.2576],[-44.462,-22.2646],[-44.4587,-22.2705],[-44.4969,-22.3037],[-44.5152,-22.3105],[-44.5171,-22.3159],[-44.5302,-22.3232],[-44.5327,-22.3307],[-44.5437,-22.3323],[-44.5491,-22.3243],[-44.5552,-22.3307],[-44.5635,-22.3316],[-44.5706,-22.3246],[-44.5804,-22.3283],[-44.5926,-22.3229],[-44.61,-22.3266],[-44.6261,-22.3353],[-44.6277,-22.3447],[-44.642,-22.3562],[-44.6459,-22.365],[-44.6582,-22.3735],[-44.6619,-22.3805],[-44.6659,-22.3727],[-44.6704,-22.3748],[-44.708,-22.3688],[-44.7212,-22.3602],[-44.7296,-22.3608],[-44.7411,-22.3731],[-44.7561,-22.3747],[-44.7929,-22.3869],[-44.8035,-22.3937],[-44.8094,-22.4043],[-44.8094,-22.4056],[-44.7947,-22.4089],[-44.7785,-22.4089],[-44.7701,-22.4155],[-44.7553,-22.4153],[-44.7414,-22.4248],[-44.7331,-22.434],[-44.7315,-22.4414],[-44.7192,-22.4634],[-44.718,-22.4708],[-44.7237,-22.4759],[-44.7199,-22.4928],[-44.713,-22.4932],[-44.7117,-22.514],[-44.7014,-22.5107],[-44.6962,-22.5184],[-44.6882,-22.5215],[-44.6814,-22.5253],[-44.6699,-22.5393],[-44.6771,-22.5475],[-44.6788,-22.5589],[-44.6679,-22.5541],[-44.6444,-22.5556],[-44.6424,-22.5776],[-44.6465,-22.5815],[-44.6436,-22.5996],[-44.6459,-22.6039],[-44.6344,-22.6094],[-44.6227,-22.6053],[-44.6128,-22.6173],[-44.5968,-22.6102],[-44.5933,-22.6217],[-44.584,-22.6242],[-44.5742,-22.6019],[-44.564,-22.612],[-44.546,-22.607],[-44.5374,-22.6183],[-44.5285,-22.6237],[-44.531,-22.6302],[-44.5146,-22.6305],[-44.5107,-22.6401],[-44.5002,-22.6286],[-44.4802,-22.6114],[-44.4662,-22.6157],[-44.4393,-22.6047],[-44.4298,-22.5987],[-44.4154,-22.6021],[-44.4058,-22.5991],[-44.4002,-22.5822],[-44.391,-22.574],[-44.3824,-22.5735],[-44.3707,-22.5805],[-44.3598,-22.5812],[-44.3627,-22.6059],[-44.3609,-22.6118],[-44.356,-22.6149],[-44.3485,-22.606],[-44.3517,-22.6011],[-44.3472,-22.5906],[-44.3421,-22.5893],[-44.3275,-22.5882],[-44.3201,-22.5955],[-44.2829,-22.6041],[-44.2651,-22.6033],[-44.2534,-22.6125],[-44.2456,-22.6064],[-44.2326,-22.6092],[-44.2258,-22.6047],[-44.221,-22.6167],[-44.2041,-22.6155],[-44.2044,-22.6263],[-44.1912,-22.6299],[-44.1843,-22.6373],[-44.1896,-22.6491],[-44.1714,-22.6594],[-44.1656,-22.6734],[-44.1614,-22.6783],[-44.1683,-22.6879],[-44.1763,-22.6922],[-44.1739,-22.7021],[-44.1852,-22.712],[-44.2011,-22.7151],[-44.2041,-22.7197],[-44.199,-22.7353],[-44.2094,-22.737],[-44.2183,-22.7324],[-44.227,-22.7337],[-44.2431,-22.7547],[-44.2505,-22.7576],[-44.2576,-22.767],[-44.2538,-22.7808],[-44.2569,-22.7859],[-44.2402,-22.7914],[-44.2443,-22.8024],[-44.2613,-22.8063],[-44.2676,-22.829],[-44.2834,-22.8362],[-44.2854,-22.8293],[-44.2961,-22.8278],[-44.3085,-22.8328],[-44.3174,-22.84],[-44.3181,-22.8451],[-44.3253,-22.8378],[-44.3337,-22.8429],[-44.3812,-22.8584],[-44.3912,-22.8528],[-44.4005,-22.8551],[-44.4107,-22.8464],[-44.4231,-22.8505],[-44.4327,-22.8611],[-44.4333,-22.8688],[-44.4443,-22.8765],[-44.4512,-22.8768],[-44.4583,-22.8833],[-44.4669,-22.885],[-44.4713,-22.8759],[-44.4799,-22.8668],[-44.4753,-22.8572],[-44.4844,-22.8464],[-44.4946,-22.8468],[-44.5053,-22.8515],[-44.5191,-22.8657],[-44.5301,-22.8679],[-44.5552,-22.8881],[-44.5702,-22.8838],[-44.5928,-22.8844],[-44.5989,-22.8903],[-44.6071,-22.8853],[-44.62,-22.8987],[-44.6295,-22.9049],[-44.6387,-22.9142],[-44.6626,-22.9272],[-44.6752,-22.9195],[-44.6872,-22.9325],[-44.6964,-22.9321],[-44.7035,-22.9361],[-44.7136,-22.93],[-44.7279,-22.9418],[-44.7435,-22.947],[-44.7509,-22.962],[-44.7492,-22.9695],[-44.7648,-22.9833],[-44.7767,-22.9781],[-44.7919,-22.9819],[-44.7929,-22.9934],[-44.8025,-22.9988],[-44.7928,-23.0098],[-44.7986,-23.0203],[-44.7966,-23.0269],[-44.8021,-23.0325],[-44.8022,-23.0488],[-44.8119,-23.0545],[-44.8073,-23.0617],[-44.8188,-23.0915],[-44.8123,-23.092],[-44.8093,-23.1014],[-44.8163,-23.1076],[-44.8106,-23.1148],[-44.819,-23.1311],[-44.8161,-23.1403],[-44.8255,-23.1437],[-44.8213,-23.1535],[-44.8244,-23.1627],[-44.8429,-23.1667],[-44.8605,-23.181],[-44.8747,-23.1847],[-44.8749,-23.1967],[-44.8826,-23.2027],[-44.8801,-23.2133],[-44.8893,-23.2266],[-44.886,-23.2358],[-44.8695,-23.2498],[-44.8563,-23.2485],[-44.8421,-23.2557],[-44.8397,-23.2637],[-44.828,-23.2706],[-44.8237,-23.2811],[-44.8247,-23.2916],[-44.8079,-23.2836],[-44.8054,-23.29],[-44.7874,-23.2991],[-44.7868,-23.3101],[-44.7788,-23.3145],[-44.7816,-23.3259],[-44.7777,-23.3377],[-44.7599,-23.3412],[-44.7572,-23.349],[-44.7415,-23.3589],[-44.7358,-23.3656],[-44.7242,-23.3676],[-44.7315,-23.3631],[-44.7269,-23.3535],[-44.7154,-23.3449],[-44.7012,-23.3402],[-44.6985,-23.3439],[-44.6839,-23.3426],[-44.6741,-23.3366],[-44.6713,-23.3456],[-44.6552,-23.3429],[-44.6395,-23.3311],[-44.6163,-23.3464],[-44.6068,-23.3479],[-44.6087,-23.3562],[-44.5909,-23.3622],[-44.583,-23.3576],[-44.5726,-23.3461],[-44.5618,-23.3298],[-44.5662,-23.3227],[-44.5516,-23.3075],[-44.5422,-23.3022],[-44.5358,-23.2921],[-44.5161,-23.2921],[-44.5272,-23.2728],[-44.5392,-23.2664],[-44.5438,-23.2722],[-44.5589,-23.2735],[-44.5801,-23.2708],[-44.5845,-23.2662],[-44.5761,-23.2537],[-44.5771,-23.2446],[-44.5674,-23.2356],[-44.5874,-23.2322],[-44.5992,-23.2365],[-44.5964,-23.2431],[-44.6068,-23.2511],[-44.614,-23.2522],[-44.6267,-23.2706],[-44.6304,-23.2819],[-44.6382,-23.2901],[-44.6574,-23.2928],[-44.6421,-23.2775],[-44.636,-23.2674],[-44.6345,-23.2587],[-44.6191,-23.2417],[-44.6321,-23.2403],[-44.6383,-23.234],[-44.6515,-23.235],[-44.6589,-23.2396],[-44.6639,-23.2479],[-44.6782,-23.2427],[-44.673,-23.2306],[-44.6667,-23.2351],[-44.6595,-23.2309],[-44.6571,-23.2147],[-44.6467,-23.2173],[-44.6404,-23.2144],[-44.6335,-23.2222],[-44.6236,-23.2074],[-44.6266,-23.1963],[-44.6458,-23.1943],[-44.6544,-23.1907],[-44.6571,-23.2051],[-44.6666,-23.2053],[-44.673,-23.2161],[-44.6835,-23.224],[-44.6895,-23.2215],[-44.6948,-23.2326],[-44.7103,-23.235],[-44.7153,-23.2309],[-44.7091,-23.2193],[-44.7212,-23.2018],[-44.7065,-23.1853],[-44.7105,-23.177],[-44.6983,-23.1745],[-44.7075,-23.1635],[-44.6956,-23.1483],[-44.6983,-23.1422],[-44.6947,-23.1313],[-44.6885,-23.1251],[-44.6989,-23.1212],[-44.6942,-23.1065],[-44.6943,-23.0963],[-44.6856,-23.0805],[-44.6845,-23.0717],[-44.6686,-23.0542],[-44.6564,-23.0523],[-44.6511,-23.0565],[-44.6453,-23.0468],[-44.6377,-23.0487],[-44.6163,-23.0443],[-44.6068,-23.0487],[-44.5929,-23.0465],[-44.5931,-23.0593],[-44.5782,-23.0542],[-44.5552,-23.0363],[-44.5305,-23.0271],[-44.5211,-23.0273],[-44.5025,-23.027],[-44.4867,-23.0164],[-44.4841,-23.0085],[-44.4761,-23.0058],[-44.4705,-23.0108],[-44.462,-23.0077],[-44.4513,-23.0166],[-44.4485,-23.0252],[-44.438,-23.0211],[-44.4451,-23.0115],[-44.4396,-23.0028],[-44.4304,-22.9984],[-44.4412,-22.9922],[-44.4344,-22.9852],[-44.4373,-22.9737],[-44.4344,-22.963],[-44.4267,-22.961],[-44.423,-22.9506],[-44.4139,-22.9538],[-44.3893,-22.9516],[-44.3778,-22.9581],[-44.3664,-22.96],[-44.3526,-22.952],[-44.3548,-22.9447],[-44.3717,-22.9384],[-44.3666,-22.9286],[-44.3583,-22.9269],[-44.3534,-22.9312],[-44.3446,-22.9226],[-44.3381,-22.9233],[-44.3207,-22.936],[-44.3227,-22.9421],[-44.3333,-22.9468],[-44.3354,-22.9646],[-44.3189,-22.9565],[-44.3016,-22.9573],[-44.311,-22.9695],[-44.3118,-22.9789],[-44.333,-22.9957],[-44.3454,-22.9915],[-44.3549,-22.9985],[-44.3563,-23.0071],[-44.363,-23.0156],[-44.346,-23.0268],[-44.335,-23.0239],[-44.3288,-23.0158],[-44.3032,-23.0024],[-44.2971,-23.0098],[-44.3039,-23.0217],[-44.2984,-23.0261],[-44.2897,-23.0237],[-44.2884,-23.0173],[-44.2799,-23.0142],[-44.2729,-23.0037],[-44.2667,-23.0015],[-44.2593,-23.0065],[-44.2509,-22.9978],[-44.2399,-23.0028],[-44.2305,-23.0142],[-44.2315,-23.0224],[-44.2475,-23.0485],[-44.2376,-23.0565],[-44.2239,-23.0488],[-44.2193,-23.05],[-44.2014,-23.0383],[-44.1939,-23.041],[-44.1949,-23.0544],[-44.1858,-23.0498],[-44.1729,-23.0481],[-44.176,-23.0364],[-44.1657,-23.0339]]],[[[-41.9776,-22.9785],[-41.9831,-22.979],[-42.0033,-22.9934],[-42.0059,-23.0091],[-41.9884,-23.0049],[-41.9746,-22.9922],[-41.9776,-22.9785]]],[[[-41.9366,-22.8626],[-41.9452,-22.8636],[-41.9479,-22.8741],[-41.9403,-22.8736],[-41.9366,-22.8626]]],[[[-43.6678,-23.0531],[-43.6368,-23.0506],[-43.6118,-23.0503],[-43.5868,-23.0533],[-43.5683,-23.0594],[-43.5665,-23.0548],[-43.577,-23.0481],[-43.604,-23.0387],[-43.614,-23.031],[-43.6566,-23.0391],[-43.6666,-23.0426],[-43.706,-23.0529],[-43.754,-23.0598],[-43.7931,-23.0615],[-43.8063,-23.0613],[-43.8284,-23.0582],[-43.881,-23.0421],[-43.8774,-23.0498],[-43.8784,-23.0626],[-43.8849,-23.0683],[-43.8995,-23.0688],[-43.919,-23.0583],[-43.9334,-23.0572],[-43.9475,-23.0504],[-43.9535,-23.0413],[-43.9733,-23.0453],[-43.9808,-23.0563],[-44.002,-23.0738],[-44.011,-23.0784],[-44.008,-23.094],[-43.988,-23.1024],[-43.9696,-23.0912],[-43.9543,-23.087],[-43.8821,-23.0747],[-43.8461,-23.0717],[-43.793,-23.0639],[-43.7659,-23.0618],[-43.733,-23.0578],[-43.6678,-23.0531]]],[[[-43.8825,-22.9248],[-43.8965,-22.9332],[-43.904,-22.9308],[-43.9109,-22.9414],[-43.9019,-22.9591],[-43.8926,-22.9564],[-43.8822,-22.9487],[-43.8688,-22.9247],[-43.8825,-22.9248]]],[[[-44.03,-22.996],[-44.0525,-23.0033],[-44.0375,-23.0112],[-44.0299,-23.0077],[-44.03,-22.996]]],[[[-43.9169,-22.9911],[-43.928,-22.9891],[-43.9374,-22.9987],[-43.931,-23.0074],[-43.9169,-22.9911]]],[[[-44.5914,-23.2037],[-44.5999,-23.2056],[-44.6054,-23.2153],[-44.6143,-23.2176],[-44.6117,-23.2246],[-44.6017,-23.2218],[-44.5872,-23.2093],[-44.5914,-23.2037]]],[[[-44.6834,-23.1512],[-44.6949,-23.1562],[-44.6936,-23.1643],[-44.6822,-23.1577],[-44.6834,-23.1512]]],[[[-43.5992,-23.0282],[-43.6023,-23.039],[-43.5897,-23.0407],[-43.5992,-23.0282]]],[[[-43.2306,-22.8368],[-43.2376,-22.8392],[-43.241,-22.8467],[-43.2362,-22.8611],[-43.2223,-22.8705],[-43.2178,-22.8611],[-43.2266,-22.8562],[-43.2324,-22.8472],[-43.2239,-22.8419],[-43.2306,-22.8368]]],[[[-43.1722,-22.7756],[-43.1781,-22.7828],[-43.185,-22.7843],[-43.1904,-22.7955],[-43.2075,-22.7949],[-43.2207,-22.7846],[-43.2362,-22.7917],[-43.2564,-22.7972],[-43.2657,-22.8112],[-43.2587,-22.8196],[-43.2509,-22.8233],[-43.2484,-22.8304],[-43.2392,-22.8338],[-43.2279,-22.8214],[-43.2169,-22.8172],[-43.2036,-22.8202],[-43.1929,-22.8195],[-43.1869,-22.8291],[-43.1808,-22.8313],[-43.1726,-22.8253],[-43.1784,-22.8027],[-43.1695,-22.7934],[-43.1574,-22.7873],[-43.1575,-22.7786],[-43.1722,-22.7756]]],[[[-41.0238,-21.6053],[-41.0484,-21.5891],[-41.0443,-21.6068],[-41.0459,-21.6162],[-41.03,-21.6164],[-41.0178,-21.614],[-41.0238,-21.6053]]]]},"properties":{"codarea":"33"}}]};

    //add option to get poly in mulyipoly in which holy poly is pointsinradiusarea
    //with boolean centroid in poly of multipoly

    //get biggest poly in multipoly
    var statecoords;
    if (riostatefeaturecollection.features[0].geometry.type == 'MultiPolygon') {
      var masterArray = riostatefeaturecollection.features[0].geometry.coordinates;
      var itemlength = 0;
      var itemindex;
      masterArray.forEach(function(item, i){
        if (item[0].length > itemlength) {
          itemlength = item[0].length;
          itemindex = i;
        }
      });

      statecoords = riostatefeaturecollection.features[0].geometry.coordinates[itemindex];
    }else {
      statecoords = riostatefeaturecollection.features[0].geometry.coordinates[2];
    }

    var turfstatepolygon = flipturfcoords(turf.polygon(statecoords));
    var turfholepolygon = flipturfcoords(turf.polygon(jacarepaguairportfeatureCollection.features[0].geometry.coordinates));
    var statewithhole = [turf.getCoords(turfstatepolygon), turf.getCoords(turfholepolygon)];
    var statepolygon = L.polygon(statewithhole, {color: 'rgba(255, 255, 255, 0.5)', color: 'black', weight: 3, fillColor: 'black', fillOpacity: 0.5});
    statepolygon.addTo(map);
  }

//polyfromline()
function polyfromline(turfline){
  var gigrunway = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"LineString","coordinates":[[-43.23862552642822,-22.829074976140674],[-43.26364517211913,-22.812500996264195]]}}]};
  var runwayline = turf.lineString(gigrunway.features[0].geometry.coordinates);
  var getoffsetLine1 = turf.lineOffset(flipturfcoords(runwayline), -0.03, {units: 'kilometers'});
  var getoffsetLine2 = turf.lineOffset(flipturfcoords(runwayline), 0.03, {units: 'kilometers'});
  var offsetLine1 = turf.getCoords(getoffsetLine1);
  var offsetLine2 = turf.getCoords(getoffsetLine2);

  var runwaypoly = L.polygon([offsetLine1[0], offsetLine2[0], offsetLine2[1], offsetLine1[1]]);
  //runwaypoly.addTo(map);
}

//circlemarker()
function circlemarker(){
  var lisloc = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-9.130668640136719,38.770279512555156]}}]};
  var riocityloc = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-43.1982421875,-22.91792293614603]}}]};
  var getturfmarker = flipturfcoords(turf.point(riocityloc.features[0].geometry.coordinates));

  //use red polylines between airports

  var subwaydotstyle = {radius: 5, color: 'black', weight: 3, fillColor: 'white', fillOpacity: 1};
  //radius in meters //increase radius and do point offset if two lines for same circle
  var subwaydottooltip = {permanent: 'true', direction: 'bottom'};
  var airportdotstyle = {radius: 3, color: 'red', weight: 3, fillColor: 'red', fillOpacity: 1};
  var airportdottooltip = {permanent: 'true', direction: 'right', className: 'airporttooltipstyle', offset: [-6, 0]};
  //offset above is cofigured for right direction of tooltip, bringing it closer to marker
  var uberdotstyle = {radius: 4, color: 'black', weight: 4, fillColor: 'white', fillOpacity: 1};

  var circlemarker = L.circleMarker(turf.getCoords(getturfmarker), uberdotstyle);
  circlemarker.bindTooltip("LIS", airportdottooltip).openTooltip();
  circlemarker.addTo(map);

  var setairportdottooltip = document.getElementsByClassName('airporttooltipstyle')[0];
  setairportdottooltip.style.backgroundColor = "transparent";
  setairportdottooltip.style.border = "none";
  setairportdottooltip.style.boxShadow = "none";
  setairportdottooltip.style.fontSize = "16px";
  setairportdottooltip.style.color = "black";
  setairportdottooltip.style.fontWeight = "bold";

  //below is work arroud to remove arrow of tooltip
  var styleElem = document.head.appendChild(document.createElement("style"));
  styleElem.innerHTML = ".airporttooltipstyle:before {border: none;}";
}

//measurepolycircle()
function measurepolycircle(){
  //takes any one or more features, returns area in square meters
  var feature = turf.polygon([[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]);
  var circle = turf.point([50.5, 30.5], {radius: 200});
  //L.circle([50.5, 30.5], {radius: 200})
  var typeoffeature = circle.geometry.type;

  if (typeoffeature == 'polygon') {
    var area = turf.area(feature); //turf feature
  }else if (typeoffeature == 'point' && circle.properties.hasOwnProperty('radius')) {
    var radius = circle.properties.radius;
    //var radius = circle._mRadius;
    var area = 2*3.14*radius; //in meters
  }
  return area
}

//addcirclewithrighttooltipdirection()
function addcirclewithrighttooltipdirection(){

  var subwaystations = {"type":"FeatureCollection","name":"Esta%C3%A7%C3%B5es_Metr%C3%B4","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"OBJECTID":1,"Cod":1,"Nome":"Pavuna","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.36484818699684,-22.80661994460496]}},{"type":"Feature","properties":{"OBJECTID":2,"Cod":2,"Nome":"Engenheiro Rubens Paiva","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.35845219284542,-22.816266209398265]}},{"type":"Feature","properties":{"OBJECTID":3,"Cod":3,"Nome":"Acari / Fazenda Botafogo","Flg_ATM":0,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.34964247534861,-22.82451848014957]}},{"type":"Feature","properties":{"OBJECTID":4,"Cod":4,"Nome":"Coelho Neto","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.34325654364894,-22.831475250979118]}},{"type":"Feature","properties":{"OBJECTID":5,"Cod":5,"Nome":"Colégio","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.33386102638136,-22.84268515051918]}},{"type":"Feature","properties":{"OBJECTID":6,"Cod":6,"Nome":"Irajá","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.32329318627627,-22.84795033714736]}},{"type":"Feature","properties":{"OBJECTID":7,"Cod":7,"Nome":"Vicente de Carvalho","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":1,"Corredor":"Transcarioca","Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1996},"geometry":{"type":"Point","coordinates":[-43.31305971270195,-22.854063372906637]}},{"type":"Feature","properties":{"OBJECTID":8,"Cod":8,"Nome":"Tomaz Coelho","Flg_ATM":0,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1996},"geometry":{"type":"Point","coordinates":[-43.30676191481164,-22.86240349705848]}},{"type":"Feature","properties":{"OBJECTID":9,"Cod":9,"Nome":"Engenho da Rainha","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1991},"geometry":{"type":"Point","coordinates":[-43.297407512986716,-22.86785011778942]}},{"type":"Feature","properties":{"OBJECTID":10,"Cod":10,"Nome":"Inhauma","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1983},"geometry":{"type":"Point","coordinates":[-43.28336903058594,-22.874558547359328]}},{"type":"Feature","properties":{"OBJECTID":11,"Cod":11,"Nome":"Del Castilho","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Fundão, Jacarepaguá, Barra","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1983},"geometry":{"type":"Point","coordinates":[-43.271853183838665,-22.87928657279164]}},{"type":"Feature","properties":{"OBJECTID":12,"Cod":12,"Nome":"Maria da Graça","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1983},"geometry":{"type":"Point","coordinates":[-43.26028321950222,-22.881541868723573]}},{"type":"Feature","properties":{"OBJECTID":13,"Cod":13,"Nome":"Triagem","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1988},"geometry":{"type":"Point","coordinates":[-43.24433414824465,-22.896952514195977]}},{"type":"Feature","properties":{"OBJECTID":14,"Cod":14,"Nome":"Maracanã","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.23386969561326,-22.909741868839518]}},{"type":"Feature","properties":{"OBJECTID":15,"Cod":15,"Nome":"São Cristóvão","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.22190708425827,-22.909714011543702]}},{"type":"Feature","properties":{"OBJECTID":16,"Cod":16,"Nome":"Estácio","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":"Estação de transferência entre as Linhas 1 e 2","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Caju, Rodoviária","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1980},"geometry":{"type":"Point","coordinates":[-43.20658767015703,-22.913375506104497]}},{"type":"Feature","properties":{"OBJECTID":17,"Cod":17,"Nome":"Saens Peña","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Usina, Muda, Grajaú, Andaraí","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1982},"geometry":{"type":"Point","coordinates":[-43.23230034027629,-22.923966026311508]}},{"type":"Feature","properties":{"OBJECTID":18,"Cod":18,"Nome":"São Francisco Xavier","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Vila Isabel, Méier","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1982},"geometry":{"type":"Point","coordinates":[-43.22388708085689,-22.92051278050233]}},{"type":"Feature","properties":{"OBJECTID":19,"Cod":19,"Nome":"Afonso Pena","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1982},"geometry":{"type":"Point","coordinates":[-43.21804930938056,-22.91799144516465]}},{"type":"Feature","properties":{"OBJECTID":20,"Cod":21,"Nome":"Central","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":"Estação com Posto de Gratuidade","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.19158022458404,-22.904714871618214]}},{"type":"Feature","properties":{"OBJECTID":21,"Cod":22,"Nome":"Presidente Vargas","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.18612228933554,-22.90322412012118]}},{"type":"Feature","properties":{"OBJECTID":22,"Cod":23,"Nome":"Uruguaiana","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1980},"geometry":{"type":"Point","coordinates":[-43.18147231311358,-22.903326354875116]}},{"type":"Feature","properties":{"OBJECTID":23,"Cod":24,"Nome":"Carioca","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":"Estação com Achados e Perdidos","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":1,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.177554616558666,-22.907341148160032]}},{"type":"Feature","properties":{"OBJECTID":24,"Cod":25,"Nome":"Cinelândia","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":1,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.17534649056847,-22.911601914606162]}},{"type":"Feature","properties":{"OBJECTID":25,"Cod":26,"Nome":"Glória","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.176737426066865,-22.919984955685727]}},{"type":"Feature","properties":{"OBJECTID":26,"Cod":27,"Nome":"Catete","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.1766206801837,-22.925870042480636]}},{"type":"Feature","properties":{"OBJECTID":27,"Cod":28,"Nome":"Largo do Machado","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Laranjeiras, Cosme Velho, Rodoviária","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.17780059567881,-22.93113468015914]}},{"type":"Feature","properties":{"OBJECTID":28,"Cod":29,"Nome":"Flamengo","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.17894025371077,-22.93762355598309]}},{"type":"Feature","properties":{"OBJECTID":29,"Cod":30,"Nome":"Botafogo","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Urca","Flg_Metro_Superficie":1,"Metro_Superficie":"Gávea","Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.183837013276296,-22.95119916496453]}},{"type":"Feature","properties":{"OBJECTID":30,"Cod":31,"Nome":"Cardeal Arcoverde","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.18095151107914,-22.964591004564657]}},{"type":"Feature","properties":{"OBJECTID":31,"Cod":32,"Nome":"Siqueira Campos","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2003},"geometry":{"type":"Point","coordinates":[-43.18662794499636,-22.967165356025987]}},{"type":"Feature","properties":{"OBJECTID":32,"Cod":33,"Nome":"Praca Onze","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.200269942194225,-22.909902547549525]}},{"type":"Feature","properties":{"OBJECTID":33,"Cod":34,"Nome":"Cantagalo","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2007},"geometry":{"type":"Point","coordinates":[-43.19382037556304,-22.97667155516197]}},{"type":"Feature","properties":{"OBJECTID":34,"Cod":35,"Nome":"Cidade Nova","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2009},"geometry":{"type":"Point","coordinates":[-43.20622826469264,-22.908746469727394]}},{"type":"Feature","properties":{"OBJECTID":35,"Cod":36,"Nome":"Ipanema / General Osório","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":1,"Metro_Superficie":"Gávea","Data_Inauguracao":2009},"geometry":{"type":"Point","coordinates":[-43.19713611190942,-22.98475519190108]}},{"type":"Feature","properties":{"OBJECTID":36,"Cod":37,"Nome":"Uruguai","Flg_ATM":0,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2014},"geometry":{"type":"Point","coordinates":[-43.23972716484286,-22.931567136415314]}},{"type":"Feature","properties":{"OBJECTID":37,"Cod":38,"Nome":"Nossa Senhora da Paz","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.20680515011423,-22.98379694866132]}},{"type":"Feature","properties":{"OBJECTID":38,"Cod":39,"Nome":"Jardim de Alah","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.214625089434804,-22.982834928725342]}},{"type":"Feature","properties":{"OBJECTID":39,"Cod":40,"Nome":"Antero de Quental","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.22319637086567,-22.985089688528017]}},{"type":"Feature","properties":{"OBJECTID":40,"Cod":41,"Nome":"São Conrado","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":null,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.25399704106544,-22.99212484864226]}},{"type":"Feature","properties":{"OBJECTID":41,"Cod":42,"Nome":"Jardim Oceânico","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":1,"Corredor":"Transoeste","Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.310896210126934,-23.006794326856706]}}]}

  var l1subwaystations = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"OBJECTID":36,"Cod":37,"Nome":"Uruguai","Flg_ATM":0,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2014},"geometry":{"type":"Point","coordinates":[-43.23972716484286,-22.931567136415314]}},{"type":"Feature","properties":{"OBJECTID":17,"Cod":17,"Nome":"Saens Peña","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Usina, Muda, Grajaú, Andaraí","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1982},"geometry":{"type":"Point","coordinates":[-43.23230034027629,-22.923966026311508]}},{"type":"Feature","properties":{"OBJECTID":18,"Cod":18,"Nome":"São Francisco Xavier","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Vila Isabel, Méier","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1982},"geometry":{"type":"Point","coordinates":[-43.22388708085689,-22.92051278050233]}},{"type":"Feature","properties":{"OBJECTID":19,"Cod":19,"Nome":"Afonso Pena","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1982},"geometry":{"type":"Point","coordinates":[-43.21804930938056,-22.91799144516465]}},{"type":"Feature","properties":{"OBJECTID":32,"Cod":33,"Nome":"Praca Onze","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.200269942194225,-22.909902547549525]}},{"type":"Feature","properties":{"OBJECTID":16,"Cod":16,"Nome":"Estácio","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":"Estação de transferência entre as Linhas 1 e 2","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Caju, Rodoviária","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1980},"geometry":{"type":"Point","coordinates":[-43.20658767015703,-22.913375506104497]}},{"type":"Feature","properties":{"OBJECTID":20,"Cod":21,"Nome":"Central","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":"Estação com Posto de Gratuidade","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.19158022458404,-22.904714871618214]}},{"type":"Feature","properties":{"OBJECTID":21,"Cod":22,"Nome":"Presidente Vargas","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.18612228933554,-22.90322412012118]}},{"type":"Feature","properties":{"OBJECTID":22,"Cod":23,"Nome":"Uruguaiana","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1980},"geometry":{"type":"Point","coordinates":[-43.18147231311358,-22.903326354875116]}},{"type":"Feature","properties":{"OBJECTID":23,"Cod":24,"Nome":"Carioca","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":"Estação com Achados e Perdidos","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":1,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.177554616558666,-22.907341148160032]}},{"type":"Feature","properties":{"OBJECTID":24,"Cod":25,"Nome":"Cinelândia","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":1,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.17534649056847,-22.911601914606162]}},{"type":"Feature","properties":{"OBJECTID":25,"Cod":26,"Nome":"Glória","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.176737426066865,-22.919984955685727]}},{"type":"Feature","properties":{"OBJECTID":26,"Cod":27,"Nome":"Catete","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.1766206801837,-22.925870042480636]}},{"type":"Feature","properties":{"OBJECTID":27,"Cod":28,"Nome":"Largo do Machado","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Laranjeiras, Cosme Velho, Rodoviária","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.17780059567881,-22.93113468015914]}},{"type":"Feature","properties":{"OBJECTID":28,"Cod":29,"Nome":"Flamengo","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.17894025371077,-22.93762355598309]}},{"type":"Feature","properties":{"OBJECTID":29,"Cod":30,"Nome":"Botafogo","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Urca","Flg_Metro_Superficie":1,"Metro_Superficie":"Gávea","Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.183837013276296,-22.95119916496453]}},{"type":"Feature","properties":{"OBJECTID":30,"Cod":31,"Nome":"Cardeal Arcoverde","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.18095151107914,-22.964591004564657]}},{"type":"Feature","properties":{"OBJECTID":31,"Cod":32,"Nome":"Siqueira Campos","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2003},"geometry":{"type":"Point","coordinates":[-43.18662794499636,-22.967165356025987]}},{"type":"Feature","properties":{"OBJECTID":33,"Cod":34,"Nome":"Cantagalo","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2007},"geometry":{"type":"Point","coordinates":[-43.19382037556304,-22.97667155516197]}},{"type":"Feature","properties":{"OBJECTID":35,"Cod":36,"Nome":"Ipanema / General Osório","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":0,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":1,"Metro_Superficie":"Gávea","Data_Inauguracao":2009},"geometry":{"type":"Point","coordinates":[-43.19713611190942,-22.98475519190108]}},{"type":"Feature","properties":{"OBJECTID":37,"Cod":38,"Nome":"Nossa Senhora da Paz","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.20680515011423,-22.98379694866132]}},{"type":"Feature","properties":{"OBJECTID":38,"Cod":39,"Nome":"Jardim de Alah","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.214625089434804,-22.982834928725342]}},{"type":"Feature","properties":{"OBJECTID":39,"Cod":40,"Nome":"Antero de Quental","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.22319637086567,-22.985089688528017]}},{"type":"Feature","properties":{"OBJECTID":40,"Cod":41,"Nome":"São Conrado","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":null,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.25399704106544,-22.99212484864226]}},{"type":"Feature","properties":{"OBJECTID":41,"Cod":42,"Nome":"Jardim Oceânico","Flg_ATM":1,"Flg_Bicicletario":null,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":0,"Obs":"Nova Linha 4","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":1,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":1,"Corredor":"Transoeste","Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2016},"geometry":{"type":"Point","coordinates":[-43.310896210126934,-23.006794326856706]}}]};

  var l2subwaystations = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"OBJECTID":1,"Cod":1,"Nome":"Pavuna","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.36484818699684,-22.80661994460496]}},{"type":"Feature","properties":{"OBJECTID":2,"Cod":2,"Nome":"Engenheiro Rubens Paiva","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.35845219284542,-22.816266209398265]}},{"type":"Feature","properties":{"OBJECTID":3,"Cod":3,"Nome":"Acari / Fazenda Botafogo","Flg_ATM":0,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.34964247534861,-22.82451848014957]}},{"type":"Feature","properties":{"OBJECTID":4,"Cod":4,"Nome":"Coelho Neto","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.34325654364894,-22.831475250979118]}},{"type":"Feature","properties":{"OBJECTID":5,"Cod":5,"Nome":"Colégio","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.33386102638136,-22.84268515051918]}},{"type":"Feature","properties":{"OBJECTID":6,"Cod":6,"Nome":"Irajá","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1998},"geometry":{"type":"Point","coordinates":[-43.32329318627627,-22.84795033714736]}},{"type":"Feature","properties":{"OBJECTID":7,"Cod":7,"Nome":"Vicente de Carvalho","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":1,"Corredor":"Transcarioca","Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1996},"geometry":{"type":"Point","coordinates":[-43.31305971270195,-22.854063372906637]}},{"type":"Feature","properties":{"OBJECTID":8,"Cod":8,"Nome":"Tomaz Coelho","Flg_ATM":0,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1996},"geometry":{"type":"Point","coordinates":[-43.30676191481164,-22.86240349705848]}},{"type":"Feature","properties":{"OBJECTID":9,"Cod":9,"Nome":"Engenho da Rainha","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1991},"geometry":{"type":"Point","coordinates":[-43.297407512986716,-22.86785011778942]}},{"type":"Feature","properties":{"OBJECTID":10,"Cod":10,"Nome":"Inhauma","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1983},"geometry":{"type":"Point","coordinates":[-43.28336903058594,-22.874558547359328]}},{"type":"Feature","properties":{"OBJECTID":11,"Cod":11,"Nome":"Del Castilho","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Fundão, Jacarepaguá, Barra","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1983},"geometry":{"type":"Point","coordinates":[-43.271853183838665,-22.87928657279164]}},{"type":"Feature","properties":{"OBJECTID":12,"Cod":12,"Nome":"Maria da Graça","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1983},"geometry":{"type":"Point","coordinates":[-43.26028321950222,-22.881541868723573]}},{"type":"Feature","properties":{"OBJECTID":13,"Cod":13,"Nome":"Triagem","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1988},"geometry":{"type":"Point","coordinates":[-43.24433414824465,-22.896952514195977]}},{"type":"Feature","properties":{"OBJECTID":14,"Cod":14,"Nome":"Maracanã","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.23386969561326,-22.909741868839518]}},{"type":"Feature","properties":{"OBJECTID":15,"Cod":15,"Nome":"São Cristóvão","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.22190708425827,-22.909714011543702]}},{"type":"Feature","properties":{"OBJECTID":34,"Cod":35,"Nome":"Cidade Nova","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":0,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":2009},"geometry":{"type":"Point","coordinates":[-43.20622826469264,-22.908746469727394]}},{"type":"Feature","properties":{"OBJECTID":20,"Cod":21,"Nome":"Central","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":"Estação com Posto de Gratuidade","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":1,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.19158022458404,-22.904714871618214]}},{"type":"Feature","properties":{"OBJECTID":21,"Cod":22,"Nome":"Presidente Vargas","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.18612228933554,-22.90322412012118]}},{"type":"Feature","properties":{"OBJECTID":22,"Cod":23,"Nome":"Uruguaiana","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1980},"geometry":{"type":"Point","coordinates":[-43.18147231311358,-22.903326354875116]}},{"type":"Feature","properties":{"OBJECTID":23,"Cod":24,"Nome":"Carioca","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":"Estação com Achados e Perdidos","Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":1,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.177554616558666,-22.907341148160032]}},{"type":"Feature","properties":{"OBJECTID":24,"Cod":25,"Nome":"Cinelândia","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":1,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.17534649056847,-22.911601914606162]}},{"type":"Feature","properties":{"OBJECTID":25,"Cod":26,"Nome":"Glória","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1979},"geometry":{"type":"Point","coordinates":[-43.176737426066865,-22.919984955685727]}},{"type":"Feature","properties":{"OBJECTID":26,"Cod":27,"Nome":"Catete","Flg_ATM":1,"Flg_Bicicletario":1,"Flg_Elevador":0,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.1766206801837,-22.925870042480636]}},{"type":"Feature","properties":{"OBJECTID":27,"Cod":28,"Nome":"Largo do Machado","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Laranjeiras, Cosme Velho, Rodoviária","Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.17780059567881,-22.93113468015914]}},{"type":"Feature","properties":{"OBJECTID":28,"Cod":29,"Nome":"Flamengo","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":0,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":null,"Flg_Metro_Superficie":0,"Metro_Superficie":null,"Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.17894025371077,-22.93762355598309]}},{"type":"Feature","properties":{"OBJECTID":29,"Cod":30,"Nome":"Botafogo","Flg_ATM":1,"Flg_Bicicletario":0,"Flg_Elevador":1,"Flg_Linha1":1,"Flg_Linha2":1,"Obs":null,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"Flg_Linha4":0,"Integra_Trem":0,"Integra_Onibus":1,"Integra_BRT":0,"Corredor":null,"Integra_VLT":0,"Onibus":"Urca","Flg_Metro_Superficie":1,"Metro_Superficie":"Gávea","Data_Inauguracao":1981},"geometry":{"type":"Point","coordinates":[-43.183837013276296,-22.95119916496453]}}]};
  //remember to check order of points as order matters

  var features = l2subwaystations.features;
  //console.log(features.length);

  var prevdirection;

  for (var i = 0; i < features.length; i++) {

    if (i < features.length - 1) {
      var point1 = flipturfcoords(turf.point(features[i].geometry.coordinates));
      var point2 = flipturfcoords(turf.point(features[i + 1].geometry.coordinates));
    }else if (i == features.length -1) {
      var point1 = flipturfcoords(turf.point(features[i-1].geometry.coordinates));
      var point2 = flipturfcoords(turf.point(features[i].geometry.coordinates));
    }

    var bearing = turf.bearing(point1, point2);
    var direction = tooltipdirection(bearing);
    var distance = turf.distance(point1, point2, {units: 'kilometers'}).toFixed(2);

    if (prevdirection == undefined) {
      prevdirection = direction;
    }else {
      direction = avoidtooltipcolision(prevdirection, direction, distance);
      prevdirection = direction;
    }

    addpointwithtooltip(features[i], direction, bearing, distance);

  }

}

function avoidtooltipcolision(prevdirection, direction, distance){

  if (prevdirection == undefined) {
    prevdirection = direction;
  }else if (prevdirection == direction) {
    if (distance < 1) {
      if (direction == 'top') {
        direction = 'bottom';
      }else if (direction == 'right') {
        direction = 'left';
      }
    }
    prevdirection = direction;
  }else {
    prevdirection = direction;
  }
  return direction
}

function tooltipdirection(bearing){

  bearing = bearing.toFixed(0);

  if (bearing >= 1 && bearing <= 90) {
    var direction = 'top'; //'top'
  }else if (bearing >= 91 && bearing <= 170) {
    var direction = 'right';
  }else if (bearing >= 171 && bearing <= 174) {
    var direction = 'bottom';
  }else if (bearing == 176 && bearing <= 180) { //bearing 176 returns undefined
    var direction = 'right';
  }else if (bearing >= -179 && bearing <= -165) {
    var direction = 'bottom'; //bottom
  }else if (bearing >= -164 && bearing <= -160) {
    var direction = 'right'; //bottom
  }else if (bearing >= -159 && bearing <= -151) {
    var direction = 'top'; //bottom
  }else if (bearing >= -150 && bearing <= -90) {
    var direction = 'right'; //bottom
  }else if (bearing >= -90 && bearing <= -50) {
    var direction = 'right'; //bottom
  }else if (bearing >= -49 && bearing <= -5) {
    var direction = 'right'; //'left'
  }else if (bearing >= -4 && bearing <= 0) { //bearing 0 returns undefined
    var direction = 'top'; //'left
  }else if (bearing >= -89 && bearing <= -41) {
    var direction = 'right'; //'left'
  }
  return direction
}

function addpointwithtooltip(feature, direction, bearing, distance){

  //console.log(feature.properties.Nome + ' ' + ' ' + bearing.toFixed(0) + ' ' + direction + ' ' + distance);

  var radius = pointradius(feature.properties.Flg_Linha1 == 1, feature.properties.Flg_Linha2 == 1);
  var setoffset = tooltipoffset(radius, direction);
  //offset tooltip based on circle radius and direction

  var subwaydotstyle = {radius: radius, color: 'black', weight: 3, fillColor: 'white', fillOpacity: 1};
  var point = L.circleMarker(turf.getCoords(flipturfcoords(turf.point(feature.geometry.coordinates))), subwaydotstyle);

  var subwaydottooltip = {permanent: 'true', direction: direction, offset: setoffset, className: 'subwaystationtooltip'};
  var gettooltipcontent  = tooltipcontent(feature.properties, {infolength: 'short'}); //infolength: 'short' or infolength: 'long'

  point.bindTooltip(gettooltipcontent, subwaydottooltip).openTooltip();
  //option to show tooltip only on click
  //add line break to station names?
  point.addTo(map);

  //see if below can be adapted to be based on map zoom level
    //var tooltip = document.getElementsByClassName('subwaystationtooltip');
    //tooltip[tooltip.length-1].style.fontSize = "10px";
    //tooltip[tooltip.length-1].style.padding = "0px";
}

function tooltipcontent(properties, options){

  var stationname = '<span class="material-icons">subway</span>' + properties.Nome;
  var subwaylines = '<br/>';
  var ammenities = '<br/>';
  var integrations = '<br/>';

  if (properties.hasOwnProperty("Flg_Ativa") && properties.Flg_Ativa == 1) {

  }
  if (properties.hasOwnProperty("Status") && properties.Status == 1) {

  }

  if (options.hasOwnProperty("infolength")) {
    if (properties.hasOwnProperty("Flg_Linha1") && properties.Flg_Linha1 == 1) {
      subwaylines += '<span class="transit-line orange">1</span>';
    }
    if (properties.hasOwnProperty("Flg_Linha2") && properties.Flg_Linha2 == 1) {
      subwaylines += '<span class="transit-line green">2</span>';
    }
    if (properties.hasOwnProperty("Flg_Linha4") && properties.Flg_Linha4 == 1) {
      subwaylines += '<span class="transit-line yellow">4</span>';
    }

    if (options.infolength == 'long') {
      if (properties.hasOwnProperty('Flg_ATM') && properties.Flg_ATM == 1) {
        ammenities += '<span class="material-icons">atm</span>';
      }
      if (properties.hasOwnProperty("Flg_Bicicletario") && properties.Flg_Bicicletario == 1) {

      }
      if (properties.hasOwnProperty("Flg_Elevador") && properties.Flg_Elevador == 1) {
        ammenities += '<span class="material-icons">elevator</span>';
      }

      if (properties.hasOwnProperty("Integra_Trem") && properties.Integra_Trem == 1) {
        integrations += '<span class="material-icons">train</span>';
      }
      if (properties.hasOwnProperty("Integra_Onibus") && properties.Integra_Onibus == 1) {
        if (properties.hasOwnProperty("Onibus") && properties.Onibus != null) {
          var typeofinfo = typeof properties.Onibus
          if (typeofinfo == 'object') { //is array in fact
            for (var i = 0; i < properties.Onibus.length -1; i++) {
              integrations += '<span class="material-icons">directions_bus</span>' + properties.Onibus[i];
            }
          }else if (typeofinfo == 'string') {
            var elements = properties.Onibus.split(',');

            for (var i = 0; i < elements.length -1; i++) {
              integrations += '<span class="material-icons">directions_bus</span>' + elements[i];
            }
          }
        }else {
          integrations += '<span class="material-icons">directions_bus</span>';
        }
      }
      if (properties.hasOwnProperty("Integra_BRT") && properties.Integra_BRT == 1) {
        if (properties.hasOwnProperty("Corredor") && properties.Corredor != null) {

        }else {

        }
      }
      if (properties.hasOwnProperty("Integra_VLT") && properties.Integra_VLT == 1) {
        integrations += '<span class="material-icons">tram</span>';
      }
      if (properties.hasOwnProperty("Flg_Metro_Superficie") && properties.Flg_Metro_Superficie == 1) {
        if (properties.hasOwnProperty("Metro_Superficie") && properties.Metro_Superficie != null) {

        }else {

        }
      }
    }
  }


  var tooltipcontent = stationname + subwaylines;

  if ((ammenities != '<br/>')){
    tooltipcontent += ammenities;
  }
  if (integrations != '<br/>') {
    tooltipcontent += integrations;
  }

  return tooltipcontent
}

function pointradius(hasline1, hasline2){
  if (hasline1 == 1 && hasline2 == 1) {
    var radius = 8;
  }else {
    var radius = 5;
  }
  return radius
}

function tooltipoffset(radius, direction){

  if (radius == 5) {
    if (direction == 'right') {
      var setoffset = [8, 0];
    }else if (direction == 'bottom') {
      var setoffset = [0, 8];
    }else if (direction == 'left') {
      var setoffset = [-8, 0];
    }else if (direction == 'top') {
      var setoffset = [0, -8];
    }
  }else if (radius == 8) {
    if (direction == 'right') {
      var setoffset = [11, 0];
    }else if (direction == 'bottom') {
      var setoffset = [0, 11];
    }else if (direction == 'left') {
      var setoffset = [-11, 0];
    }else if (direction == 'top') {
      var setoffset = [0, -11];
    }
  }else {
    var setoffset = [0, 0];
  }
  return setoffset
}

//subwaylines()
function subwaylines(){
  var subwaylines = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"OBJECTID":2,"Tipo":"Linha 1","CodLinMetr":1,"Flg_Ativa":null,"Status":null,"Data_Inc":null,"ShapeSTLength":17377.649145484404},"geometry":{"type":"LineString","coordinates":[[-43.23965488310974,-22.93162773026284],[-43.23224189877922,-22.92404078105965],[-43.22389076068938,-22.920602094718006],[-43.217911866632896,-22.918028828828994],[-43.20654363933881,-22.913443315512385],[-43.200259210196066,-22.910021650701648],[-43.19611098415613,-22.90608346188194],[-43.19253806005968,-22.9050632927853],[-43.19155335501711,-22.904801669702525],[-43.18984637532385,-22.904348131945692],[-43.18610922767279,-22.903314741779727],[-43.18149491253734,-22.903419758551678],[-43.17882309807776,-22.904751216229823],[-43.17759518922979,-22.907498799599395],[-43.175447265642106,-22.91162835165676],[-43.176834097581605,-22.91997318425863],[-43.177212128999635,-22.923183621302012],[-43.17722190978465,-22.9239391897906],[-43.176792949921214,-22.9250374675227],[-43.17671836717816,-22.925871494717654],[-43.17677462963887,-22.92690133680882],[-43.1779423265504,-22.930372343115945],[-43.17788800004569,-22.931143379456056],[-43.17775848863001,-22.932507971417866],[-43.178111910308836,-22.93667619163029],[-43.18165071422484,-22.9411609596398],[-43.18399716881112,-22.946506121050565],[-43.18393450792923,-22.95120028147439],[-43.18392609752064,-22.95183024255883],[-43.182037227284596,-22.9565976733409],[-43.17872857056962,-22.957669064257843],[-43.178405610873206,-22.96008708740785],[-43.18102221237237,-22.964522503994278],[-43.186674056545996,-22.967081322754687],[-43.18670174364982,-22.967106335305246],[-43.19041608249178,-22.97108851301478],[-43.193909934766296,-22.97663450751554],[-43.195191992017925,-22.980311937084895],[-43.19722579645323,-22.984719717021857]]}},{"type":"Feature","properties":{"OBJECTID":3,"Tipo":"Linha 4","CodLinMetr":4,"Flg_Ativa":1,"Status":null,"Data_Inc":null,"ShapeSTLength":12129.134341801213},"geometry":{"type":"LineString","coordinates":[[-43.19713611176264,-22.98475519200802],[-43.20102555359126,-22.98430695204104],[-43.20680515001902,-22.983796948758435],[-43.211126348058364,-22.983388552735253],[-43.2146250893707,-22.982834928864794],[-43.215767020001145,-22.982981871430443],[-43.219424246688455,-22.983849234513126],[-43.22319637077551,-22.985089688609733],[-43.22817763132199,-22.986738277246314],[-43.23213431772891,-22.98758887376607],[-43.240573602022124,-22.988548957154077],[-43.2489362050322,-22.990463479058416],[-43.253997041033394,-22.99212484870484],[-43.26146606209419,-22.994218355185968],[-43.27759869612912,-22.996825783440165],[-43.28853288293826,-22.999572619917643],[-43.29733026467231,-23.002952833873472],[-43.30257152332171,-23.00627800460889],[-43.303160972972464,-23.00661405635452],[-43.30351502666927,-23.006785106473966],[-43.30387466073859,-23.006922764466704],[-43.30425559906913,-23.007008083710108],[-43.304962072712144,-23.00706821547318],[-43.306397995703314,-23.00700234444874],[-43.30806924468358,-23.00690074538632],[-43.310896210191736,-23.00679432698938]]}},{"type":"Feature","properties":{"OBJECTID":1,"Tipo":"Linha 2","CodLinMetr":2,"Flg_Ativa":null,"Status":null,"Data_Inc":null,"ShapeSTLength":31438.009039029632},"geometry":{"type":"LineString","coordinates":[[-43.3648481873341,-22.806619944453665],[-43.363349636727314,-22.80784802620584],[-43.36299072034701,-22.80822665642041],[-43.36272922828669,-22.808540575716897],[-43.36258413250008,-22.808819848517484],[-43.3624318798765,-22.809158784304124],[-43.3622529979473,-22.809569130533063],[-43.36208771490772,-22.809919879254565],[-43.361856288367726,-22.81041331641617],[-43.3616124746039,-22.8108648098764],[-43.36106034163,-22.811773106118835],[-43.35994803655021,-22.81372102924736],[-43.35925835889278,-22.814813086036256],[-43.35884350167775,-22.815555523000455],[-43.35837580631422,-22.81640494042411],[-43.357899624516484,-22.817261677841774],[-43.35768180289577,-22.817855364343547],[-43.35751520733941,-22.81831361952562],[-43.357304224671886,-22.81871168031435],[-43.357166552955626,-22.818907391721343],[-43.35687975489424,-22.819179222974103],[-43.35650275062531,-22.819450123167016],[-43.35620471310055,-22.819584442834213],[-43.355719462930615,-22.81974669816484],[-43.355280533623215,-22.81980787790012],[-43.35480387793766,-22.819791009389096],[-43.35425713675061,-22.819707705307696],[-43.35363887424052,-22.819677423001515],[-43.353225717991684,-22.819738863356893],[-43.35293476705676,-22.819819486994888],[-43.3526432405326,-22.819947893636996],[-43.35231240743691,-22.820129655852572],[-43.35204269219189,-22.820305836368277],[-43.351842957617805,-22.820584771560362],[-43.351581128032315,-22.82092256097273],[-43.351203502850595,-22.821778859428328],[-43.35095653844763,-22.822487167716407],[-43.35060489405286,-22.823325812171923],[-43.35027711002255,-22.823788362773616],[-43.349669376258866,-22.824486958131626],[-43.348355507151915,-22.8260264887406],[-43.34693026374204,-22.8277141915433],[-43.34553900804779,-22.829252891804668],[-43.34430540528085,-22.83054232470425],[-43.343256543720926,-22.831475250947612],[-43.34216154774849,-22.8324913199583],[-43.34182205564351,-22.83285217639872],[-43.34140320815634,-22.833379467257032],[-43.341140168632414,-22.833812802101892],[-43.34048361630418,-22.834950905337738],[-43.338505017757726,-22.83824682449056],[-43.33678681277711,-22.841188809295808],[-43.33631965783161,-22.84180092060223],[-43.33611320422752,-22.842018673078194],[-43.335875955096704,-22.842183454533963],[-43.33564200061318,-22.842342296017666],[-43.33537942930088,-22.842442894135797],[-43.33492899103518,-22.842595886858465],[-43.334162454889,-22.842666719212904],[-43.3326609252495,-22.842758525186458],[-43.33209501135773,-22.84286729014938],[-43.331784026569245,-22.843000229670587],[-43.331480249432765,-22.843176254147536],[-43.33119150074543,-22.843388276828584],[-43.33033018163204,-22.84425377951494],[-43.32937456440432,-22.845240148575837],[-43.32899934103569,-22.84556595209661],[-43.32854704615303,-22.845869440693928],[-43.32804096737766,-22.846143689867432],[-43.327512387741244,-22.846360354377836],[-43.326852428730845,-22.846568467708654],[-43.3259285706361,-22.84685265443317],[-43.3249887153044,-22.84717967718441],[-43.324296674028325,-22.84748062984423],[-43.323293186638566,-22.847950337524924],[-43.32232704030618,-22.84852795681195],[-43.32129154951398,-22.849083333488853],[-43.3203959566357,-22.849582833000294],[-43.31975741118736,-22.849934507188905],[-43.31936062680114,-22.85012386144724],[-43.318847486443644,-22.85034065865091],[-43.3182252827507,-22.850620816093464],[-43.31778147597572,-22.850859847195604],[-43.31737607023999,-22.851120787554038],[-43.31697057508908,-22.851388894252068],[-43.31529409028169,-22.852489406138506],[-43.311845404811606,-22.854918741052188],[-43.31101054837121,-22.855504847122788],[-43.31047933896554,-22.855929303052992],[-43.31015062251407,-22.8562412153623],[-43.30947594403166,-22.85700821984155],[-43.308892122074276,-22.857670876066344],[-43.30837741998601,-22.85827249232849],[-43.30785739925267,-22.859041132990814],[-43.307659524665894,-22.859404608825127],[-43.30745347099623,-22.859803838249118],[-43.30731764325778,-22.860153637137856],[-43.30702082969739,-22.861010667374856],[-43.306922870374095,-22.86142538278296],[-43.306839134980684,-22.861940604723532],[-43.30675557681401,-22.8624414920248],[-43.306657082369966,-22.86289921067018],[-43.30652036058956,-22.863320681068874],[-43.30640808437861,-22.86364205630913],[-43.30613890216344,-22.864140966782518],[-43.30594163661816,-22.86445426824202],[-43.30558017382378,-22.864909185264242],[-43.30510278318186,-22.865355698138266],[-43.304642281483936,-22.86568769754283],[-43.304283924662734,-22.86589175647299],[-43.303926101084606,-22.86605281102559],[-43.30357627749956,-22.86619244497614],[-43.30319569452638,-22.86631741392961],[-43.295597713841175,-22.86832929916843],[-43.29343967476775,-22.868936961029576],[-43.292221339600864,-22.869246452963996],[-43.29184838403684,-22.869378643653928],[-43.29143648659957,-22.869531919763343],[-43.2910085813607,-22.86972803204558],[-43.29040899198628,-22.870044156695037],[-43.28982459925981,-22.870381946971225],[-43.2893718697881,-22.87070681448526],[-43.2891139378262,-22.870919085709076],[-43.288283210524234,-22.87177749679753],[-43.28766265471843,-22.87253064326035],[-43.28731693906867,-22.872957011160302],[-43.28701915767563,-22.87326203549384],[-43.286565782515325,-22.873637064644466],[-43.28603550826432,-22.873975422685096],[-43.28542122966134,-22.874226855066993],[-43.28492458983811,-22.874350526525344],[-43.284296909720645,-22.874436942104342],[-43.28313463429877,-22.874589265809902],[-43.28141491756822,-22.87477856661038],[-43.280826178468665,-22.874843884544653],[-43.28039968703217,-22.874925291095728],[-43.280026976929925,-22.87503595070116],[-43.27937491356536,-22.875215268593397],[-43.27807114410738,-22.875545227450143],[-43.27734919246681,-22.875745284481727],[-43.27673471113008,-22.87601101605671],[-43.27636072891497,-22.876222006939944],[-43.27602514794815,-22.876454918045184],[-43.27568155938694,-22.8767092454205],[-43.27454059714533,-22.87762155869455],[-43.273571962085164,-22.878363698852134],[-43.273158569112006,-22.878631598825372],[-43.27205304959732,-22.879185870796423],[-43.271064272127035,-22.879684059279235],[-43.269300083856876,-22.88032433263654],[-43.267157502502755,-22.880910284995537],[-43.26633309714908,-22.88126070268884],[-43.265891055552686,-22.88134089972139],[-43.2653950135832,-22.88141433788904],[-43.26477530194367,-22.88147925619483],[-43.26413311427449,-22.881486582309186],[-43.26028321949552,-22.88154186880336],[-43.25884681495507,-22.881527457208875],[-43.25746756242272,-22.881500399040704],[-43.256983287355325,-22.8815607982161],[-43.25637539714802,-22.881709440747304],[-43.25568832397269,-22.88200057425963],[-43.25499212954741,-22.882500673349934],[-43.25289879983715,-22.88487301453568],[-43.25174019146653,-22.88624013037104],[-43.251576285952616,-22.886453369907606],[-43.251352605602015,-22.886803339372417],[-43.251167294281025,-22.887177624281183],[-43.25083434972771,-22.888004262106346],[-43.25067474285193,-22.888384802283085],[-43.250535928386434,-22.88865207715677],[-43.250319070655756,-22.88897225299659],[-43.24999869014634,-22.889321155546533],[-43.249292696076914,-22.890077973881763],[-43.24913591798524,-22.89023752838594],[-43.24882827076185,-22.890598515474313],[-43.24730366951472,-22.892845620156145],[-43.2467976316397,-22.893592683897268],[-43.24658720328701,-22.893912924537943],[-43.24633617574065,-22.894382051418095],[-43.24611146969129,-22.894809654539504],[-43.24587409949169,-22.895219197008302],[-43.2457029594343,-22.8954920829463],[-43.24546743050583,-22.895758284570746],[-43.24522491656055,-22.896066221761984],[-43.24499675443559,-22.896260823420292],[-43.24433414815641,-22.89695251451127],[-43.24329828849955,-22.897980305194878],[-43.24291271027399,-22.898382230574736],[-43.24240949561145,-22.89897224619681],[-43.24199954680709,-22.89969821637065],[-43.24177150649326,-22.90038262954766],[-43.241652210150846,-22.901133952662743],[-43.241631615521236,-22.901731060628336],[-43.24167261566186,-22.90305162670696],[-43.241664143527316,-22.903708602125178],[-43.24164930114312,-22.90435953382861],[-43.24132138082438,-22.90490639227124],[-43.23968625568304,-22.90658377422333],[-43.23761219481694,-22.908412513616874],[-43.23654576703443,-22.90910553206102],[-43.23579450658689,-22.909372209172457],[-43.23501854227358,-22.909530595860392],[-43.233869696081186,-22.909741869154733],[-43.23221401336477,-22.91000116663252],[-43.23115653880264,-22.91000133993589],[-43.230525036078156,-22.909970412695586],[-43.22986619455748,-22.91005864448874],[-43.22876770963,-22.91023754466139],[-43.22628783855202,-22.91053242931122],[-43.22551387833493,-22.910547677552493],[-43.224792894889724,-22.91045599406358],[-43.22342988658364,-22.910085521049837],[-43.222921336276656,-22.90992213672029],[-43.222608029207905,-22.909818279381735],[-43.222273718250136,-22.909742858146927],[-43.220989515871395,-22.909641812524132],[-43.22041309758568,-22.909708092135087],[-43.219844025304084,-22.90985657094904],[-43.218884734362476,-22.910216611056928],[-43.218338500738504,-22.910402538263803],[-43.217923988302005,-22.91046335506292],[-43.21754005288992,-22.91051543490519],[-43.21676664188274,-22.910488833365083],[-43.21541115538598,-22.910349125130136],[-43.21401575468978,-22.910137038652206],[-43.212755658697176,-22.910051184674384],[-43.210422275511135,-22.909795536590934],[-43.208996399614364,-22.909607434006574],[-43.20743063003033,-22.90923137384594],[-43.2062282648057,-22.908746469896762],[-43.205369350633504,-22.90835081332408],[-43.20373465013619,-22.907335993865473],[-43.20225318574374,-22.906437579647328],[-43.201113975617,-22.906067720538406],[-43.199723627689735,-22.90558703086094],[-43.19918438867695,-22.905407694145],[-43.198573368831156,-22.905293247788187],[-43.19797767623781,-22.905296267357453],[-43.19638084914915,-22.90531615504864],[-43.19596762637819,-22.90535924873489],[-43.19537183972068,-22.905555571994224],[-43.194864001951856,-22.905632936013287],[-43.19158022491346,-22.904714871868567],[-43.189873749260926,-22.904261467922343],[-43.186122289637424,-22.903224120099107],[-43.18146924397015,-22.90333001835285],[-43.17874633152766,-22.904686940057193],[-43.17750618548153,-22.907461901606588],[-43.175346325162494,-22.911614396991936],[-43.176737426298615,-22.919984955258823],[-43.177114710969725,-22.923189070863025],[-43.17712422285882,-22.923923883258244],[-43.176696870334,-22.925018043251413],[-43.176620679719356,-22.92587004277645],[-43.17667789315977,-22.926917300996504],[-43.17784386812462,-22.930383196301914],[-43.17779079120226,-22.931136484704652],[-43.17766066441768,-22.932507549588944],[-43.178016883422586,-22.93670879263525],[-43.18156491901613,-22.941205264974418],[-43.18389943457288,-22.946523238097093],[-43.183837013701336,-22.951199165121054]]}}]};

  subwaylines.features.forEach((item, i) => {
    if (item.properties.Tipo == "Linha 1") {
      var color = 'orange';
    }else if (item.properties.Tipo == "Linha 2") {
      var color = 'green';
    }else if (item.properties.Tipo == "Linha 4") {
      var color = 'yellow';
    }

    if (item.properties.Tipo == "Linha 2") {
      //offset must change depending on zoomlevel
        //offset 0.3 for big zoom out
        //ofset 0.1 for medium zoom levels
        //offser 0.01 for close zoom levels
        //no offser for closest zoom
      //change circle marker radius based on zoom level to match lines on close and closest zoom levels

      var offsetLine = turf.lineOffset(flipturfcoords(turf.lineString(item.geometry.coordinates)), 0.0001, {units: 'kilometers'});
      var line = L.polyline(turf.getCoords(offsetLine), {color: color, weight: 4});
    }else {
      var line = L.polyline(turf.getCoords(flipturfcoords(turf.lineString(item.geometry.coordinates))), {color: color, weight: 4});
    }
    line.addTo(map);
  });

}

//pinmarkerwithimg()
function pinmarkerwithimg(){

  var materialdesignicon = '<i class="material-icons">weekend</i>';
  var icon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#c30b82;' class='marker-pin-c'></div>" + materialdesignicon,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });

//use white background (.marker-pin-c::after)? google maps does not use it

var styles = `
  .marker-pin-c {
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    background: #c30b82;
    position: absolute;
    transform: rotate(-45deg);
    /*left: 50%;*/
    /*top: 50%;*/
    /*margin: -15px 0 0 -15px;*/
  }
  .marker-pin-c::after {
      content: '';
      width: 20px;
      height: 20px;
      margin: 4px 6px;
      background: #fff;
      position: absolute;
      border-radius: 50%;
    }
    .custom-div-icon i {
      position: absolute;
      /*width: 22px;*/
      font-size: 15px;
      /*left: 0;*/
      /*right: 0;*/
      margin: 5px 7px 5px; /*10px auto;*/ /*top, left and right, bottom*/
      /*text-align: center;*/
    }

    .custom-div-icon i.awesome {
      margin: 12px auto;
      font-size: 17px;
    }
    `;

var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

var marker = L.marker([-22.948316375779143, -43.16408157348633], {
      icon: icon
    }).addTo(map);
}

//greatcircleline()
function greatcircleline(){

  var gigcoords = [-22.802294535135648, -43.254547119140625];
  var lhrcoords = [51.46479618582845, -0.4868102073669433];

  var greatcirclelinecoords = turfgreatCircle(gigcoords, lhrcoords);
  var newgreatCirlcecoords = turf.getCoords(greatcirclelinecoords);

  var greatCircle = L.polyline(newgreatCirlcecoords);

  var getroutedistance = routedistance(greatcirclelinecoords);
  greatCircle.bindTooltip(getroutedistance, {permanent: 'true', direction: 'bottom', className: 'greatcirclelinetooltipstyle'}).openTooltip();

  greatCircle.addTo(map);
  //map.fitBounds(greatCircle.getBounds());


  var point1 = L.marker(gigcoords);
  var point2 = L.marker(lhrcoords);
  point1.addTo(map);
  point2.addTo(map);
}

//greatcirclerange()
function greatcirclerange(){

  var gigcoords = [-22.802294535135648, -43.254547119140625];
  var radiusinm = 3000000; //radius in meters //  10.000.000m  = 10.000 km

  //gigmarker.getLatLng()
  var greatCirclerange = L.greatCircle(gigcoords, {radius: radiusinm, color: 'white', fillColor: 'white'});

  var point1 = L.marker(gigcoords);

  //greatCirclerange.bindTooltip(radius + 'm', {permanent: 'true', direction: 'bottom', className: 'greatcirclelinetooltipstyle'}).openTooltip();
  //above not working

  var radiusinkm = numberWithThousandSeparator(radiusinm/1000) + 'km';
  point1.bindTooltip("Galeão" + '<br/> radius: ' + radiusinkm, {permanent: 'true', direction: 'bottom', className: 'greatcirclelinetooltipstyle'}).openTooltip();

  point1.addTo(map);
  greatCirclerange.addTo(map);

  //L.marker(greatCirclerange._latLngsM[0][0]).addTo(map);
  //marker above is in the wrong map repetition

  var maskgeojson = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-139.21874999999997,-65.80277639340238],[37.265625,-65.80277639340238],[37.265625,38.54816542304656],[-139.21874999999997,38.54816542304656],[-139.21874999999997,-65.80277639340238]]]}}]};

  var polygon = flipturfcoords(turf.polygon(maskgeojson.features[0].geometry.coordinates));

  //var mask = turf.polygon(greatCirclerange._latLngsM); //polygon error

  //console.log(greatCirclerange._latLngs);
  //L.polygon(greatCirclerange._latLngsM).addTo(map);

  //var masked = turf.mask(polygon, mask);
  //console.log(masked);

  //console.log(greatCirclerange._latLngs);
  //create diffpolygon with black fillcolor
}

function numberWithThousandSeparator(x) {
    return x.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

//below only works with hardcode, needs formula for flexibility
//partialpolyfrompolywithcolor()
function partialpolyfrompolywithcolor(){
  var getpoly = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-43.251800537109375,-22.946379936193033],[-43.17747116088867,-22.946379936193033],[-43.17747116088867,-22.913337638067766],[-43.251800537109375,-22.913337638067766],[-43.251800537109375,-22.946379936193033]]]}}]};
  var riostatefeaturecollection = {"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-44.2315,-23.0753],[-44.2377,-23.0928],[-44.2528,-23.0974],[-44.2495,-23.1094],[-44.2583,-23.1157],[-44.2726,-23.1174],[-44.282,-23.1348],[-44.2973,-23.1314],[-44.2941,-23.1227],[-44.2966,-23.1166],[-44.3062,-23.1212],[-44.3133,-23.1333],[-44.3204,-23.1367],[-44.3201,-23.1437],[-44.3251,-23.1541],[-44.3442,-23.156],[-44.3549,-23.1596],[-44.3624,-23.166],[-44.3684,-23.165],[-44.3776,-23.1724],[-44.3735,-23.1831],[-44.3621,-23.1835],[-44.3552,-23.1911],[-44.346,-23.1809],[-44.3395,-23.1903],[-44.3485,-23.2036],[-44.3512,-23.2142],[-44.3448,-23.2185],[-44.3453,-23.2252],[-44.3334,-23.2236],[-44.3293,-23.2073],[-44.3222,-23.2027],[-44.3113,-23.1805],[-44.2886,-23.1766],[-44.2717,-23.1798],[-44.2626,-23.1925],[-44.2566,-23.1889],[-44.2468,-23.2011],[-44.2307,-23.1997],[-44.2266,-23.1957],[-44.2067,-23.1926],[-44.1927,-23.1987],[-44.1882,-23.1825],[-44.1778,-23.1797],[-44.1702,-23.1845],[-44.1591,-23.172],[-44.14,-23.167],[-44.1313,-23.1692],[-44.1234,-23.1765],[-44.1299,-23.1841],[-44.1185,-23.1861],[-44.1088,-23.1785],[-44.0945,-23.1748],[-44.0913,-23.1659],[-44.1078,-23.1618],[-44.1206,-23.153],[-44.1377,-23.1597],[-44.1405,-23.1389],[-44.1271,-23.1253],[-44.1269,-23.1195],[-44.148,-23.1249],[-44.1555,-23.1388],[-44.164,-23.142],[-44.1699,-23.1376],[-44.1726,-23.1287],[-44.1687,-23.1199],[-44.1764,-23.1171],[-44.186,-23.1209],[-44.2017,-23.1197],[-44.2069,-23.1033],[-44.1952,-23.1064],[-44.1947,-23.0986],[-44.2075,-23.0977],[-44.2163,-23.0898],[-44.2334,-23.0907],[-44.2315,-23.0753]]],[[[-44.372,-23.0368],[-44.3743,-23.0314],[-44.3907,-23.042],[-44.3814,-23.0462],[-44.3748,-23.0439],[-44.3619,-23.0463],[-44.358,-23.0588],[-44.3515,-23.0539],[-44.3478,-23.0428],[-44.3521,-23.037],[-44.364,-23.041],[-44.372,-23.0368]]],[[[-44.1657,-23.0339],[-44.1536,-23.038],[-44.13,-23.0325],[-44.1244,-23.0263],[-44.1133,-23.0232],[-44.1043,-23.0111],[-44.0957,-23.0043],[-44.097,-22.9969],[-44.0852,-22.9923],[-44.0776,-22.9788],[-44.0762,-22.9707],[-44.0813,-22.9595],[-44.0743,-22.952],[-44.0617,-22.9489],[-44.0473,-22.942],[-44.04,-22.9525],[-44.0418,-22.9619],[-44.0551,-22.9793],[-44.0478,-22.9843],[-44.0325,-22.9804],[-44.0305,-22.9643],[-44.0113,-22.949],[-44.0059,-22.9421],[-43.9909,-22.9403],[-43.9764,-22.9314],[-43.9658,-22.9345],[-43.9496,-22.9269],[-43.94,-22.9304],[-43.9319,-22.9289],[-43.9105,-22.931],[-43.8941,-22.9226],[-43.882,-22.9209],[-43.8806,-22.9158],[-43.8709,-22.9053],[-43.8457,-22.9017],[-43.839,-22.911],[-43.852,-22.9242],[-43.8423,-22.9322],[-43.832,-22.9312],[-43.8102,-22.9176],[-43.8028,-22.9248],[-43.796,-22.9171],[-43.7897,-22.9258],[-43.7843,-22.9243],[-43.7757,-22.9318],[-43.7453,-22.9465],[-43.7316,-22.9579],[-43.7247,-22.9607],[-43.7165,-22.9706],[-43.711,-22.9706],[-43.7001,-22.9861],[-43.691,-22.9893],[-43.6808,-22.9814],[-43.6745,-22.9803],[-43.664,-22.9869],[-43.6542,-23],[-43.6432,-23.0011],[-43.6388,-23.006],[-43.6278,-23.0066],[-43.6141,-23.0176],[-43.5996,-23.0229],[-43.5943,-23.0324],[-43.5797,-23.0396],[-43.5786,-23.0451],[-43.5624,-23.0532],[-43.5687,-23.0655],[-43.5664,-23.0752],[-43.5544,-23.074],[-43.5489,-23.0607],[-43.5421,-23.0591],[-43.5322,-23.0497],[-43.508,-23.0473],[-43.5074,-23.0429],[-43.4928,-23.0353],[-43.4677,-23.0299],[-43.4544,-23.0252],[-43.4198,-23.0176],[-43.3879,-23.0131],[-43.3576,-23.0111],[-43.3359,-23.0114],[-43.3028,-23.0163],[-43.2874,-23.0111],[-43.2747,-23.0023],[-43.2521,-22.9991],[-43.2457,-23.001],[-43.232,-22.9953],[-43.231,-22.9908],[-43.2176,-22.987],[-43.1982,-22.9879],[-43.1882,-22.9858],[-43.1853,-22.9742],[-43.1592,-22.9589],[-43.1502,-22.9507],[-43.1558,-22.9433],[-43.1625,-22.9438],[-43.17,-22.9523],[-43.1801,-22.9485],[-43.1686,-22.9387],[-43.1713,-22.9324],[-43.1626,-22.9172],[-43.1615,-22.9053],[-43.1692,-22.9046],[-43.1811,-22.8954],[-43.1962,-22.8921],[-43.2108,-22.8976],[-43.2161,-22.8867],[-43.2014,-22.8715],[-43.2099,-22.867],[-43.2134,-22.8731],[-43.2257,-22.8741],[-43.2365,-22.862],[-43.245,-22.8406],[-43.2549,-22.8365],[-43.2669,-22.8235],[-43.2728,-22.8098],[-43.2713,-22.7948],[-43.2772,-22.7873],[-43.2774,-22.78],[-43.2579,-22.7564],[-43.2446,-22.7511],[-43.2387,-22.7431],[-43.2255,-22.7412],[-43.2132,-22.7343],[-43.2146,-22.7277],[-43.1949,-22.7221],[-43.1803,-22.72],[-43.161,-22.7099],[-43.1425,-22.7084],[-43.1347,-22.7145],[-43.1247,-22.7137],[-43.1174,-22.7069],[-43.1157,-22.6964],[-43.1076,-22.6937],[-43.1004,-22.686],[-43.0929,-22.6859],[-43.0809,-22.6797],[-43.0664,-22.6868],[-43.0572,-22.6852],[-43.0513,-22.6927],[-43.0389,-22.6926],[-43.0332,-22.7183],[-43.0259,-22.7261],[-43.0266,-22.7431],[-43.0466,-22.7572],[-43.0643,-22.7651],[-43.0684,-22.7786],[-43.0814,-22.7898],[-43.0791,-22.7989],[-43.0651,-22.8029],[-43.0828,-22.8206],[-43.0969,-22.8279],[-43.0954,-22.8343],[-43.1034,-22.8559],[-43.109,-22.8646],[-43.1153,-22.8645],[-43.1342,-22.8813],[-43.1249,-22.895],[-43.1357,-22.8977],[-43.1312,-22.9084],[-43.1159,-22.9048],[-43.1104,-22.9111],[-43.1005,-22.9141],[-43.0948,-22.9206],[-43.0986,-22.9316],[-43.1119,-22.9353],[-43.1198,-22.926],[-43.1312,-22.9392],[-43.1156,-22.9391],[-43.1104,-22.9536],[-43.1013,-22.9527],[-43.0725,-22.9568],[-43.0544,-22.9625],[-43.0398,-22.9745],[-43.0138,-22.9768],[-43.0129,-22.9711],[-43.0015,-22.9696],[-42.9668,-22.97],[-42.9211,-22.9749],[-42.9098,-22.9741],[-42.8812,-22.967],[-42.8328,-22.9626],[-42.7763,-22.9599],[-42.7275,-22.9562],[-42.7116,-22.9561],[-42.6839,-22.9592],[-42.6818,-22.9472],[-42.6694,-22.9423],[-42.6412,-22.9375],[-42.6123,-22.9344],[-42.5788,-22.9328],[-42.5185,-22.9334],[-42.4746,-22.9378],[-42.4558,-22.9349],[-42.3816,-22.9357],[-42.3548,-22.9356],[-42.2812,-22.9395],[-42.2004,-22.9435],[-42.135,-22.9487],[-42.0739,-22.9555],[-42.0479,-22.962],[-42.0379,-22.9672],[-42.0293,-22.9828],[-42.0197,-22.9841],[-42.0153,-22.9917],[-42.008,-22.9841],[-42.0199,-22.9714],[-42.0071,-22.9622],[-42.0107,-22.9523],[-42.018,-22.9601],[-42.0268,-22.9563],[-42.0239,-22.9479],[-42.0337,-22.9452],[-42.0373,-22.9331],[-42.0373,-22.9217],[-42.0331,-22.9065],[-42.0204,-22.8888],[-42.0097,-22.8828],[-42.0042,-22.8896],[-41.9898,-22.8827],[-41.9818,-22.867],[-41.9866,-22.8584],[-41.9858,-22.8505],[-41.9766,-22.8302],[-41.9694,-22.8228],[-41.9403,-22.8094],[-41.9332,-22.8098],[-41.9282,-22.7959],[-41.9218,-22.7871],[-41.908,-22.7782],[-41.8964,-22.7858],[-41.8837,-22.7818],[-41.8768,-22.7695],[-41.8662,-22.7619],[-41.8739,-22.751],[-41.8683,-22.7427],[-41.8806,-22.74],[-41.8859,-22.7544],[-41.8957,-22.7537],[-41.9053,-22.757],[-41.9106,-22.7684],[-41.9224,-22.7712],[-41.9332,-22.7667],[-41.9456,-22.7543],[-41.9594,-22.7325],[-41.9735,-22.7296],[-41.9813,-22.723],[-41.9876,-22.7112],[-41.9942,-22.6883],[-41.9975,-22.6678],[-41.9997,-22.6326],[-41.9979,-22.6095],[-41.9914,-22.5981],[-41.9792,-22.5625],[-41.9693,-22.5431],[-41.9617,-22.5345],[-41.9467,-22.5284],[-41.9327,-22.5375],[-41.9239,-22.5302],[-41.9126,-22.5111],[-41.8972,-22.4922],[-41.8896,-22.4861],[-41.8767,-22.4878],[-41.8644,-22.477],[-41.8547,-22.4498],[-41.8391,-22.4326],[-41.8178,-22.417],[-41.795,-22.4046],[-41.7744,-22.3911],[-41.7665,-22.3782],[-41.7761,-22.3743],[-41.7735,-22.3641],[-41.7618,-22.3514],[-41.7392,-22.3391],[-41.7126,-22.3166],[-41.6891,-22.3],[-41.6582,-22.2831],[-41.6095,-22.2618],[-41.5424,-22.2346],[-41.5188,-22.2244],[-41.4938,-22.2154],[-41.4513,-22.2024],[-41.3866,-22.1855],[-41.3544,-22.1764],[-41.318,-22.1678],[-41.2646,-22.1537],[-41.2158,-22.1374],[-41.1674,-22.1158],[-41.1457,-22.1042],[-41.1338,-22.0955],[-41.1311,-22.0893],[-41.0769,-22.0578],[-41.0459,-22.042],[-41.0256,-22.0327],[-41.004,-22.0211],[-40.9908,-22.0103],[-40.9804,-21.9906],[-40.9751,-21.9666],[-40.9752,-21.941],[-40.9818,-21.9111],[-40.9889,-21.8857],[-40.9947,-21.8543],[-40.9991,-21.8412],[-41.0183,-21.7614],[-41.023,-21.7387],[-41.0248,-21.7186],[-41.0223,-21.6828],[-41.0155,-21.6445],[-41.0131,-21.6235],[-41.0245,-21.6233],[-41.0481,-21.6178],[-41.046,-21.6066],[-41.0653,-21.554],[-41.0646,-21.5492],[-41.0726,-21.5256],[-41.0729,-21.5121],[-41.0689,-21.4976],[-41.0573,-21.4789],[-41.0206,-21.4418],[-41.0058,-21.4184],[-41.0008,-21.4041],[-40.9917,-21.394],[-40.9826,-21.3916],[-40.9698,-21.3757],[-40.9614,-21.3605],[-40.9643,-21.3492],[-40.9631,-21.3278],[-40.9579,-21.3114],[-40.961,-21.3011],[-40.9647,-21.2963],[-40.977,-21.2904],[-40.995,-21.2864],[-40.9993,-21.2785],[-40.9982,-21.2673],[-41.0049,-21.2528],[-41.0154,-21.2519],[-41.0244,-21.2458],[-41.0399,-21.2551],[-41.0593,-21.2346],[-41.0895,-21.2196],[-41.1054,-21.2196],[-41.1156,-21.2286],[-41.1273,-21.2298],[-41.1371,-21.2274],[-41.1403,-21.2376],[-41.1756,-21.2447],[-41.1832,-21.2394],[-41.1904,-21.2486],[-41.2131,-21.2359],[-41.2221,-21.2329],[-41.2414,-21.2204],[-41.2565,-21.2253],[-41.2609,-21.2332],[-41.2685,-21.2327],[-41.2762,-21.2401],[-41.2826,-21.2348],[-41.3035,-21.2286],[-41.3162,-21.2135],[-41.3258,-21.2186],[-41.3327,-21.2155],[-41.3383,-21.2068],[-41.3699,-21.2042],[-41.3885,-21.1991],[-41.4031,-21.1983],[-41.4165,-21.2001],[-41.4352,-21.2157],[-41.4462,-21.2155],[-41.4696,-21.2028],[-41.4791,-21.1936],[-41.4865,-21.1799],[-41.5024,-21.1826],[-41.5116,-21.1758],[-41.5201,-21.1873],[-41.5304,-21.18],[-41.5487,-21.183],[-41.5577,-21.1733],[-41.5646,-21.1837],[-41.5698,-21.1724],[-41.5786,-21.1696],[-41.5861,-21.1597],[-41.5891,-21.1496],[-41.6126,-21.157],[-41.622,-21.147],[-41.6455,-21.1434],[-41.6654,-21.132],[-41.6639,-21.1248],[-41.6887,-21.1218],[-41.6956,-21.1155],[-41.7054,-21.1205],[-41.7049,-21.1278],[-41.7171,-21.1253],[-41.718,-21.1161],[-41.7106,-21.1111],[-41.7169,-21.1051],[-41.7263,-21.1068],[-41.7359,-21.1026],[-41.7313,-21.0873],[-41.7216,-21.0733],[-41.7235,-21.067],[-41.7326,-21.0664],[-41.7162,-21.0468],[-41.7218,-21.043],[-41.7252,-21.0329],[-41.7232,-21.0259],[-41.7154,-21.0223],[-41.7145,-21.0154],[-41.7224,-21.0092],[-41.7156,-20.9913],[-41.7101,-20.9908],[-41.718,-20.965],[-41.7173,-20.9532],[-41.7259,-20.9506],[-41.7338,-20.9433],[-41.7373,-20.9279],[-41.7221,-20.9201],[-41.7184,-20.9008],[-41.7263,-20.8924],[-41.7124,-20.8681],[-41.725,-20.8657],[-41.7415,-20.8726],[-41.739,-20.8664],[-41.7439,-20.8546],[-41.7416,-20.8415],[-41.7363,-20.8359],[-41.7426,-20.8256],[-41.7399,-20.8175],[-41.7551,-20.8068],[-41.7752,-20.7999],[-41.794,-20.7981],[-41.7992,-20.8053],[-41.817,-20.8013],[-41.8288,-20.7943],[-41.8255,-20.7885],[-41.8355,-20.7803],[-41.8446,-20.7773],[-41.852,-20.764],[-41.8747,-20.7659],[-41.8847,-20.7834],[-41.8962,-20.7884],[-41.905,-20.7974],[-41.9155,-20.7927],[-41.9282,-20.794],[-41.9262,-20.8023],[-41.9297,-20.8081],[-41.9325,-20.8257],[-41.9267,-20.8388],[-41.9297,-20.8436],[-41.937,-20.8561],[-41.9505,-20.8588],[-41.9545,-20.8656],[-41.9496,-20.8721],[-41.9602,-20.883],[-41.9598,-20.8898],[-41.965,-20.8974],[-41.9637,-20.9065],[-41.9667,-20.917],[-41.9735,-20.917],[-41.9786,-20.9349],[-42.0003,-20.9272],[-42.0172,-20.9291],[-42.0385,-20.9275],[-42.0478,-20.9347],[-42.0677,-20.9392],[-42.073,-20.9365],[-42.0863,-20.9397],[-42.0938,-20.9356],[-42.1013,-20.9435],[-42.1149,-20.9516],[-42.1148,-20.9584],[-42.1269,-20.9561],[-42.138,-20.96],[-42.1509,-20.974],[-42.1502,-20.9807],[-42.141,-20.993],[-42.127,-21.0008],[-42.1201,-21.0001],[-42.114,-21.0122],[-42.1027,-21.014],[-42.0848,-21.023],[-42.0801,-21.0302],[-42.0804,-21.0359],[-42.0949,-21.0372],[-42.1037,-21.0459],[-42.1046,-21.0547],[-42.1205,-21.0692],[-42.1185,-21.0748],[-42.1312,-21.0793],[-42.1314,-21.0871],[-42.1397,-21.1029],[-42.1517,-21.1041],[-42.1637,-21.1007],[-42.1745,-21.1318],[-42.1818,-21.1434],[-42.1901,-21.1462],[-42.1953,-21.1603],[-42.2001,-21.1727],[-42.2083,-21.179],[-42.1947,-21.2027],[-42.2017,-21.2073],[-42.2026,-21.2212],[-42.1915,-21.2236],[-42.1891,-21.2333],[-42.195,-21.2391],[-42.1897,-21.2505],[-42.1998,-21.2564],[-42.2136,-21.2725],[-42.2197,-21.2722],[-42.2287,-21.2825],[-42.2292,-21.307],[-42.2378,-21.318],[-42.2371,-21.3241],[-42.2289,-21.3286],[-42.2242,-21.3378],[-42.2356,-21.3429],[-42.2299,-21.3594],[-42.23,-21.3665],[-42.2424,-21.3729],[-42.2406,-21.3771],[-42.252,-21.3872],[-42.2367,-21.3937],[-42.2383,-21.4035],[-42.2601,-21.4097],[-42.2679,-21.3996],[-42.2753,-21.4042],[-42.2782,-21.414],[-42.2754,-21.4275],[-42.2861,-21.4423],[-42.2839,-21.4458],[-42.2921,-21.4592],[-42.2681,-21.4689],[-42.2715,-21.4746],[-42.2574,-21.4823],[-42.2546,-21.487],[-42.2597,-21.4963],[-42.2737,-21.5038],[-42.2856,-21.5281],[-42.2969,-21.5236],[-42.3064,-21.5295],[-42.3025,-21.5387],[-42.3143,-21.5556],[-42.3309,-21.5605],[-42.3249,-21.5695],[-42.346,-21.5827],[-42.3527,-21.5917],[-42.363,-21.605],[-42.3687,-21.6184],[-42.3586,-21.6308],[-42.3647,-21.6322],[-42.3696,-21.6401],[-42.3652,-21.6465],[-42.3463,-21.6518],[-42.3397,-21.6603],[-42.331,-21.6606],[-42.3017,-21.655],[-42.2879,-21.6677],[-42.2821,-21.6809],[-42.2733,-21.6779],[-42.2653,-21.6935],[-42.2727,-21.7037],[-42.2666,-21.7145],[-42.3066,-21.7284],[-42.3141,-21.7378],[-42.3335,-21.7458],[-42.3526,-21.744],[-42.3577,-21.7411],[-42.3777,-21.7484],[-42.3937,-21.7574],[-42.3956,-21.7616],[-42.4299,-21.7757],[-42.4383,-21.7761],[-42.4597,-21.7848],[-42.4632,-21.7862],[-42.4879,-21.7978],[-42.6008,-21.845],[-42.606,-21.8464],[-42.6143,-21.8559],[-42.6265,-21.8587],[-42.6403,-21.8658],[-42.6653,-21.8733],[-42.685,-21.8792],[-42.74,-21.9087],[-42.7878,-21.9296],[-42.8103,-21.9378],[-42.8155,-21.9364],[-42.8357,-21.9442],[-42.867,-21.9533],[-42.8814,-21.9593],[-42.8785,-21.9658],[-42.8936,-21.9752],[-42.8969,-21.9822],[-42.9096,-21.9907],[-42.9377,-22.0034],[-42.9471,-22.0059],[-42.9592,-22.015],[-42.969,-22.0149],[-42.9843,-22.026],[-42.9878,-22.0319],[-42.9969,-22.0361],[-43.0022,-22.0328],[-43.0079,-22.0315],[-43.0267,-22.0427],[-43.0392,-22.0446],[-43.0389,-22.053],[-43.0332,-22.0659],[-43.0531,-22.0817],[-43.0755,-22.0929],[-43.0781,-22.0831],[-43.0897,-22.0879],[-43.1062,-22.0827],[-43.1222,-22.0894],[-43.1265,-22.1038],[-43.1356,-22.1099],[-43.1423,-22.1044],[-43.1497,-22.0806],[-43.1532,-22.0744],[-43.1332,-22.0579],[-43.1276,-22.0467],[-43.1306,-22.035],[-43.1312,-22.0292],[-43.1422,-22.0334],[-43.1536,-22.033],[-43.1634,-22.0285],[-43.1696,-22.0218],[-43.1793,-22.0292],[-43.202,-22.0375],[-43.2075,-22.0297],[-43.2215,-22.0338],[-43.2277,-22.0288],[-43.2367,-22.0229],[-43.2342,-22.0142],[-43.2466,-22.0066],[-43.2548,-22.012],[-43.2615,-22.008],[-43.2675,-22.012],[-43.2805,-22.011],[-43.3022,-22.021],[-43.3162,-22.0077],[-43.3266,-22.0078],[-43.3414,-22.009],[-43.3467,-22.0038],[-43.3504,-22.008],[-43.365,-22.0105],[-43.3678,-22.0198],[-43.3828,-22.0302],[-43.4047,-22.0424],[-43.4228,-22.0552],[-43.437,-22.06],[-43.4645,-22.0728],[-43.4768,-22.0694],[-43.4821,-22.0729],[-43.5045,-22.075],[-43.5048,-22.0664],[-43.5121,-22.0592],[-43.5181,-22.0608],[-43.5257,-22.0727],[-43.5418,-22.0794],[-43.5477,-22.0789],[-43.5661,-22.0875],[-43.5694,-22.077],[-43.5747,-22.0782],[-43.5914,-22.0558],[-43.603,-22.0723],[-43.6118,-22.0721],[-43.6119,-22.0815],[-43.6212,-22.0833],[-43.636,-22.0691],[-43.6457,-22.0649],[-43.6639,-22.0735],[-43.6684,-22.0861],[-43.673,-22.0904],[-43.6802,-22.0805],[-43.6821,-22.0716],[-43.6929,-22.0714],[-43.6957,-22.0765],[-43.7089,-22.0758],[-43.7193,-22.0804],[-43.7314,-22.0962],[-43.7523,-22.0877],[-43.7612,-22.0794],[-43.7682,-22.0676],[-43.7765,-22.066],[-43.789,-22.073],[-43.7995,-22.0826],[-43.8098,-22.082],[-43.8243,-22.0908],[-43.8312,-22.0913],[-43.8416,-22.0991],[-43.8584,-22.0952],[-43.8636,-22.1004],[-43.8806,-22.1014],[-43.8797,-22.114],[-43.8922,-22.1136],[-43.9205,-22.1253],[-43.9287,-22.1306],[-43.9426,-22.1325],[-43.9535,-22.1423],[-43.9649,-22.1394],[-43.9771,-22.1464],[-43.998,-22.1559],[-44.0047,-22.1627],[-44.0146,-22.1537],[-44.0335,-22.1523],[-44.0486,-22.1622],[-44.0604,-22.1602],[-44.072,-22.1646],[-44.0763,-22.1754],[-44.084,-22.1754],[-44.0871,-22.1823],[-44.1013,-22.1737],[-44.1125,-22.1886],[-44.1214,-22.1909],[-44.125,-22.1993],[-44.1217,-22.2091],[-44.1384,-22.2155],[-44.1456,-22.2136],[-44.152,-22.2186],[-44.1544,-22.2272],[-44.1744,-22.2304],[-44.1794,-22.2285],[-44.1892,-22.2404],[-44.2083,-22.2509],[-44.2141,-22.2484],[-44.2221,-22.2527],[-44.2235,-22.2595],[-44.2368,-22.2658],[-44.2472,-22.2673],[-44.2504,-22.2605],[-44.2599,-22.268],[-44.2627,-22.2441],[-44.2915,-22.2431],[-44.3023,-22.2539],[-44.3153,-22.2543],[-44.3172,-22.2595],[-44.345,-22.2534],[-44.3524,-22.2577],[-44.3596,-22.254],[-44.3747,-22.2611],[-44.3769,-22.2683],[-44.39,-22.2705],[-44.3948,-22.2589],[-44.4332,-22.2514],[-44.4388,-22.2557],[-44.4571,-22.2576],[-44.462,-22.2646],[-44.4587,-22.2705],[-44.4969,-22.3037],[-44.5152,-22.3105],[-44.5171,-22.3159],[-44.5302,-22.3232],[-44.5327,-22.3307],[-44.5437,-22.3323],[-44.5491,-22.3243],[-44.5552,-22.3307],[-44.5635,-22.3316],[-44.5706,-22.3246],[-44.5804,-22.3283],[-44.5926,-22.3229],[-44.61,-22.3266],[-44.6261,-22.3353],[-44.6277,-22.3447],[-44.642,-22.3562],[-44.6459,-22.365],[-44.6582,-22.3735],[-44.6619,-22.3805],[-44.6659,-22.3727],[-44.6704,-22.3748],[-44.708,-22.3688],[-44.7212,-22.3602],[-44.7296,-22.3608],[-44.7411,-22.3731],[-44.7561,-22.3747],[-44.7929,-22.3869],[-44.8035,-22.3937],[-44.8094,-22.4043],[-44.8094,-22.4056],[-44.7947,-22.4089],[-44.7785,-22.4089],[-44.7701,-22.4155],[-44.7553,-22.4153],[-44.7414,-22.4248],[-44.7331,-22.434],[-44.7315,-22.4414],[-44.7192,-22.4634],[-44.718,-22.4708],[-44.7237,-22.4759],[-44.7199,-22.4928],[-44.713,-22.4932],[-44.7117,-22.514],[-44.7014,-22.5107],[-44.6962,-22.5184],[-44.6882,-22.5215],[-44.6814,-22.5253],[-44.6699,-22.5393],[-44.6771,-22.5475],[-44.6788,-22.5589],[-44.6679,-22.5541],[-44.6444,-22.5556],[-44.6424,-22.5776],[-44.6465,-22.5815],[-44.6436,-22.5996],[-44.6459,-22.6039],[-44.6344,-22.6094],[-44.6227,-22.6053],[-44.6128,-22.6173],[-44.5968,-22.6102],[-44.5933,-22.6217],[-44.584,-22.6242],[-44.5742,-22.6019],[-44.564,-22.612],[-44.546,-22.607],[-44.5374,-22.6183],[-44.5285,-22.6237],[-44.531,-22.6302],[-44.5146,-22.6305],[-44.5107,-22.6401],[-44.5002,-22.6286],[-44.4802,-22.6114],[-44.4662,-22.6157],[-44.4393,-22.6047],[-44.4298,-22.5987],[-44.4154,-22.6021],[-44.4058,-22.5991],[-44.4002,-22.5822],[-44.391,-22.574],[-44.3824,-22.5735],[-44.3707,-22.5805],[-44.3598,-22.5812],[-44.3627,-22.6059],[-44.3609,-22.6118],[-44.356,-22.6149],[-44.3485,-22.606],[-44.3517,-22.6011],[-44.3472,-22.5906],[-44.3421,-22.5893],[-44.3275,-22.5882],[-44.3201,-22.5955],[-44.2829,-22.6041],[-44.2651,-22.6033],[-44.2534,-22.6125],[-44.2456,-22.6064],[-44.2326,-22.6092],[-44.2258,-22.6047],[-44.221,-22.6167],[-44.2041,-22.6155],[-44.2044,-22.6263],[-44.1912,-22.6299],[-44.1843,-22.6373],[-44.1896,-22.6491],[-44.1714,-22.6594],[-44.1656,-22.6734],[-44.1614,-22.6783],[-44.1683,-22.6879],[-44.1763,-22.6922],[-44.1739,-22.7021],[-44.1852,-22.712],[-44.2011,-22.7151],[-44.2041,-22.7197],[-44.199,-22.7353],[-44.2094,-22.737],[-44.2183,-22.7324],[-44.227,-22.7337],[-44.2431,-22.7547],[-44.2505,-22.7576],[-44.2576,-22.767],[-44.2538,-22.7808],[-44.2569,-22.7859],[-44.2402,-22.7914],[-44.2443,-22.8024],[-44.2613,-22.8063],[-44.2676,-22.829],[-44.2834,-22.8362],[-44.2854,-22.8293],[-44.2961,-22.8278],[-44.3085,-22.8328],[-44.3174,-22.84],[-44.3181,-22.8451],[-44.3253,-22.8378],[-44.3337,-22.8429],[-44.3812,-22.8584],[-44.3912,-22.8528],[-44.4005,-22.8551],[-44.4107,-22.8464],[-44.4231,-22.8505],[-44.4327,-22.8611],[-44.4333,-22.8688],[-44.4443,-22.8765],[-44.4512,-22.8768],[-44.4583,-22.8833],[-44.4669,-22.885],[-44.4713,-22.8759],[-44.4799,-22.8668],[-44.4753,-22.8572],[-44.4844,-22.8464],[-44.4946,-22.8468],[-44.5053,-22.8515],[-44.5191,-22.8657],[-44.5301,-22.8679],[-44.5552,-22.8881],[-44.5702,-22.8838],[-44.5928,-22.8844],[-44.5989,-22.8903],[-44.6071,-22.8853],[-44.62,-22.8987],[-44.6295,-22.9049],[-44.6387,-22.9142],[-44.6626,-22.9272],[-44.6752,-22.9195],[-44.6872,-22.9325],[-44.6964,-22.9321],[-44.7035,-22.9361],[-44.7136,-22.93],[-44.7279,-22.9418],[-44.7435,-22.947],[-44.7509,-22.962],[-44.7492,-22.9695],[-44.7648,-22.9833],[-44.7767,-22.9781],[-44.7919,-22.9819],[-44.7929,-22.9934],[-44.8025,-22.9988],[-44.7928,-23.0098],[-44.7986,-23.0203],[-44.7966,-23.0269],[-44.8021,-23.0325],[-44.8022,-23.0488],[-44.8119,-23.0545],[-44.8073,-23.0617],[-44.8188,-23.0915],[-44.8123,-23.092],[-44.8093,-23.1014],[-44.8163,-23.1076],[-44.8106,-23.1148],[-44.819,-23.1311],[-44.8161,-23.1403],[-44.8255,-23.1437],[-44.8213,-23.1535],[-44.8244,-23.1627],[-44.8429,-23.1667],[-44.8605,-23.181],[-44.8747,-23.1847],[-44.8749,-23.1967],[-44.8826,-23.2027],[-44.8801,-23.2133],[-44.8893,-23.2266],[-44.886,-23.2358],[-44.8695,-23.2498],[-44.8563,-23.2485],[-44.8421,-23.2557],[-44.8397,-23.2637],[-44.828,-23.2706],[-44.8237,-23.2811],[-44.8247,-23.2916],[-44.8079,-23.2836],[-44.8054,-23.29],[-44.7874,-23.2991],[-44.7868,-23.3101],[-44.7788,-23.3145],[-44.7816,-23.3259],[-44.7777,-23.3377],[-44.7599,-23.3412],[-44.7572,-23.349],[-44.7415,-23.3589],[-44.7358,-23.3656],[-44.7242,-23.3676],[-44.7315,-23.3631],[-44.7269,-23.3535],[-44.7154,-23.3449],[-44.7012,-23.3402],[-44.6985,-23.3439],[-44.6839,-23.3426],[-44.6741,-23.3366],[-44.6713,-23.3456],[-44.6552,-23.3429],[-44.6395,-23.3311],[-44.6163,-23.3464],[-44.6068,-23.3479],[-44.6087,-23.3562],[-44.5909,-23.3622],[-44.583,-23.3576],[-44.5726,-23.3461],[-44.5618,-23.3298],[-44.5662,-23.3227],[-44.5516,-23.3075],[-44.5422,-23.3022],[-44.5358,-23.2921],[-44.5161,-23.2921],[-44.5272,-23.2728],[-44.5392,-23.2664],[-44.5438,-23.2722],[-44.5589,-23.2735],[-44.5801,-23.2708],[-44.5845,-23.2662],[-44.5761,-23.2537],[-44.5771,-23.2446],[-44.5674,-23.2356],[-44.5874,-23.2322],[-44.5992,-23.2365],[-44.5964,-23.2431],[-44.6068,-23.2511],[-44.614,-23.2522],[-44.6267,-23.2706],[-44.6304,-23.2819],[-44.6382,-23.2901],[-44.6574,-23.2928],[-44.6421,-23.2775],[-44.636,-23.2674],[-44.6345,-23.2587],[-44.6191,-23.2417],[-44.6321,-23.2403],[-44.6383,-23.234],[-44.6515,-23.235],[-44.6589,-23.2396],[-44.6639,-23.2479],[-44.6782,-23.2427],[-44.673,-23.2306],[-44.6667,-23.2351],[-44.6595,-23.2309],[-44.6571,-23.2147],[-44.6467,-23.2173],[-44.6404,-23.2144],[-44.6335,-23.2222],[-44.6236,-23.2074],[-44.6266,-23.1963],[-44.6458,-23.1943],[-44.6544,-23.1907],[-44.6571,-23.2051],[-44.6666,-23.2053],[-44.673,-23.2161],[-44.6835,-23.224],[-44.6895,-23.2215],[-44.6948,-23.2326],[-44.7103,-23.235],[-44.7153,-23.2309],[-44.7091,-23.2193],[-44.7212,-23.2018],[-44.7065,-23.1853],[-44.7105,-23.177],[-44.6983,-23.1745],[-44.7075,-23.1635],[-44.6956,-23.1483],[-44.6983,-23.1422],[-44.6947,-23.1313],[-44.6885,-23.1251],[-44.6989,-23.1212],[-44.6942,-23.1065],[-44.6943,-23.0963],[-44.6856,-23.0805],[-44.6845,-23.0717],[-44.6686,-23.0542],[-44.6564,-23.0523],[-44.6511,-23.0565],[-44.6453,-23.0468],[-44.6377,-23.0487],[-44.6163,-23.0443],[-44.6068,-23.0487],[-44.5929,-23.0465],[-44.5931,-23.0593],[-44.5782,-23.0542],[-44.5552,-23.0363],[-44.5305,-23.0271],[-44.5211,-23.0273],[-44.5025,-23.027],[-44.4867,-23.0164],[-44.4841,-23.0085],[-44.4761,-23.0058],[-44.4705,-23.0108],[-44.462,-23.0077],[-44.4513,-23.0166],[-44.4485,-23.0252],[-44.438,-23.0211],[-44.4451,-23.0115],[-44.4396,-23.0028],[-44.4304,-22.9984],[-44.4412,-22.9922],[-44.4344,-22.9852],[-44.4373,-22.9737],[-44.4344,-22.963],[-44.4267,-22.961],[-44.423,-22.9506],[-44.4139,-22.9538],[-44.3893,-22.9516],[-44.3778,-22.9581],[-44.3664,-22.96],[-44.3526,-22.952],[-44.3548,-22.9447],[-44.3717,-22.9384],[-44.3666,-22.9286],[-44.3583,-22.9269],[-44.3534,-22.9312],[-44.3446,-22.9226],[-44.3381,-22.9233],[-44.3207,-22.936],[-44.3227,-22.9421],[-44.3333,-22.9468],[-44.3354,-22.9646],[-44.3189,-22.9565],[-44.3016,-22.9573],[-44.311,-22.9695],[-44.3118,-22.9789],[-44.333,-22.9957],[-44.3454,-22.9915],[-44.3549,-22.9985],[-44.3563,-23.0071],[-44.363,-23.0156],[-44.346,-23.0268],[-44.335,-23.0239],[-44.3288,-23.0158],[-44.3032,-23.0024],[-44.2971,-23.0098],[-44.3039,-23.0217],[-44.2984,-23.0261],[-44.2897,-23.0237],[-44.2884,-23.0173],[-44.2799,-23.0142],[-44.2729,-23.0037],[-44.2667,-23.0015],[-44.2593,-23.0065],[-44.2509,-22.9978],[-44.2399,-23.0028],[-44.2305,-23.0142],[-44.2315,-23.0224],[-44.2475,-23.0485],[-44.2376,-23.0565],[-44.2239,-23.0488],[-44.2193,-23.05],[-44.2014,-23.0383],[-44.1939,-23.041],[-44.1949,-23.0544],[-44.1858,-23.0498],[-44.1729,-23.0481],[-44.176,-23.0364],[-44.1657,-23.0339]]],[[[-41.9776,-22.9785],[-41.9831,-22.979],[-42.0033,-22.9934],[-42.0059,-23.0091],[-41.9884,-23.0049],[-41.9746,-22.9922],[-41.9776,-22.9785]]],[[[-41.9366,-22.8626],[-41.9452,-22.8636],[-41.9479,-22.8741],[-41.9403,-22.8736],[-41.9366,-22.8626]]],[[[-43.6678,-23.0531],[-43.6368,-23.0506],[-43.6118,-23.0503],[-43.5868,-23.0533],[-43.5683,-23.0594],[-43.5665,-23.0548],[-43.577,-23.0481],[-43.604,-23.0387],[-43.614,-23.031],[-43.6566,-23.0391],[-43.6666,-23.0426],[-43.706,-23.0529],[-43.754,-23.0598],[-43.7931,-23.0615],[-43.8063,-23.0613],[-43.8284,-23.0582],[-43.881,-23.0421],[-43.8774,-23.0498],[-43.8784,-23.0626],[-43.8849,-23.0683],[-43.8995,-23.0688],[-43.919,-23.0583],[-43.9334,-23.0572],[-43.9475,-23.0504],[-43.9535,-23.0413],[-43.9733,-23.0453],[-43.9808,-23.0563],[-44.002,-23.0738],[-44.011,-23.0784],[-44.008,-23.094],[-43.988,-23.1024],[-43.9696,-23.0912],[-43.9543,-23.087],[-43.8821,-23.0747],[-43.8461,-23.0717],[-43.793,-23.0639],[-43.7659,-23.0618],[-43.733,-23.0578],[-43.6678,-23.0531]]],[[[-43.8825,-22.9248],[-43.8965,-22.9332],[-43.904,-22.9308],[-43.9109,-22.9414],[-43.9019,-22.9591],[-43.8926,-22.9564],[-43.8822,-22.9487],[-43.8688,-22.9247],[-43.8825,-22.9248]]],[[[-44.03,-22.996],[-44.0525,-23.0033],[-44.0375,-23.0112],[-44.0299,-23.0077],[-44.03,-22.996]]],[[[-43.9169,-22.9911],[-43.928,-22.9891],[-43.9374,-22.9987],[-43.931,-23.0074],[-43.9169,-22.9911]]],[[[-44.5914,-23.2037],[-44.5999,-23.2056],[-44.6054,-23.2153],[-44.6143,-23.2176],[-44.6117,-23.2246],[-44.6017,-23.2218],[-44.5872,-23.2093],[-44.5914,-23.2037]]],[[[-44.6834,-23.1512],[-44.6949,-23.1562],[-44.6936,-23.1643],[-44.6822,-23.1577],[-44.6834,-23.1512]]],[[[-43.5992,-23.0282],[-43.6023,-23.039],[-43.5897,-23.0407],[-43.5992,-23.0282]]],[[[-43.2306,-22.8368],[-43.2376,-22.8392],[-43.241,-22.8467],[-43.2362,-22.8611],[-43.2223,-22.8705],[-43.2178,-22.8611],[-43.2266,-22.8562],[-43.2324,-22.8472],[-43.2239,-22.8419],[-43.2306,-22.8368]]],[[[-43.1722,-22.7756],[-43.1781,-22.7828],[-43.185,-22.7843],[-43.1904,-22.7955],[-43.2075,-22.7949],[-43.2207,-22.7846],[-43.2362,-22.7917],[-43.2564,-22.7972],[-43.2657,-22.8112],[-43.2587,-22.8196],[-43.2509,-22.8233],[-43.2484,-22.8304],[-43.2392,-22.8338],[-43.2279,-22.8214],[-43.2169,-22.8172],[-43.2036,-22.8202],[-43.1929,-22.8195],[-43.1869,-22.8291],[-43.1808,-22.8313],[-43.1726,-22.8253],[-43.1784,-22.8027],[-43.1695,-22.7934],[-43.1574,-22.7873],[-43.1575,-22.7786],[-43.1722,-22.7756]]],[[[-41.0238,-21.6053],[-41.0484,-21.5891],[-41.0443,-21.6068],[-41.0459,-21.6162],[-41.03,-21.6164],[-41.0178,-21.614],[-41.0238,-21.6053]]]]},"properties":{"codarea":"33"}}]};

  //notes:
  //add option of start direction {direction: 'left'} and adjust polyline coords position accordingly
  //depending on polygon shape, new polygon may have different shape then intended and be bigger or smaller

  var offsetkm = -20; //negative means offset movement from left to right

  //var getturfpoly = turf.polygon(getpoly.features[0].geometry.coordinates);
  var getturfpoly = turf.polygon(riostatefeaturecollection.features[0].geometry.coordinates[2]);
  var turfpoly = flipturfcoords(turf.polygon(getturfpoly.geometry.coordinates));
  var polytoline = turf.polygonToLine(turfpoly);

  var bbox = turf.bbox(turfpoly);
  var bboxPolygon = turf.bboxPolygon(bbox);
  var getbboxcoords = turf.getCoords(bboxPolygon);
  //L.polygon(getbboxcoords, {color: 'black'}).addTo(map);

  //switch below not tested
  //switch (expression) {
    //case 'top':
      //var getline = turf.lineString([getbboxcoords[0][1], getbboxcoords[0][2]]);
      //break;
    //case 'bottom'

    //break;
  //case 'bottom'
    //var getline = turf.lineString([getbboxcoords[0][3], getbboxcoords[0][4]]);
    //break;
  //case 'left'
    //var getline = turf.lineString([getbboxcoords[0][0], getbboxcoords[0][1]]);
    //break;
  //case 'right'
    //var getline = turf.lineString([getbboxcoords[0][2], getbboxcoords[0][3]]);
    //break;
  //default:
  //}

  var getline = turf.lineString([getbboxcoords[0][0], getbboxcoords[0][1]]);

  var lenghtline = turf.lineString([getbboxcoords[0][1], getbboxcoords[0][2]]);
  var getlength = turf.length(lenghtline, {units: 'kilometers'});

  var lengthtopercentage  = offsetkm*-1/getlength *100;
  console.log(lengthtopercentage.toFixed(0) + '%');

  var offsetLine = turf.lineOffset(getline, offsetkm, {units: 'kilometers'});
  //L.polyline(offsetLine.geometry.coordinates, {color: 'orange'}).addTo(map);

  var split = turf.lineSplit(polytoline, offsetLine);
  //if above lenght == 3,use split.features[2]
  //if above lenght == 11,use split.features[4]
  //split.features position also depends on number of parts of polygon intersected by offset line

  //L.polyline([split.features[0].geometry.coordinates, split.features[0].geometry.coordinates], {color: 'pink'}).addTo(map);
  //L.polyline([split.features[0].geometry.coordinates, split.features[1].geometry.coordinates], {color: 'purple'}).addTo(map);

  var newcoords = [];
  split.features[0].geometry.coordinates.forEach((item, i) => {
    newcoords.push(item);
  });
  split.features[4].geometry.coordinates.forEach((item, i) => { //features[2]
    newcoords.push(item);
  });

  var getnewpolygon = turf.lineToPolygon(turf.lineString(newcoords));

  //below is not working
    //var diffpoly = turf.polygon([[getline.geometry.coordinates[0], getline.geometry.coordinates[1], offsetLine.geometry.coordinates[1], offsetLine.geometry.coordinates[0], getline.geometry.coordinates[0]]]);
    //L.polygon(turf.getCoords(diffpoly)).addTo(map);
    //var difference = turf.difference(getturfpoly, diffpoly);
    //var getdifference = flipturfcoords(turf.polygon(difference.geometry.coordinates));
    //L.polygon(turf.getCoords(getdifference), {color: 'pink'}).addTo(map);

  var oldpoly = L.polygon(turf.getCoords(turfpoly));
  var newpoly = L.polygon(turf.getCoords(getnewpolygon), {color: 'red'});
  //oldpoly.addTo(map);
  //newpoly.addTo(map);

  var areaold = turf.area(turfpoly);
  var areanew = turf.area(getnewpolygon);
  var getpercentage = areanew.toFixed(0)/areaold.toFixed(0) *100;
  console.log(getpercentage.toFixed(0) + '%');

  //var bounds = oldpoly.getBounds();
  //map.fitBounds(bounds);
}
