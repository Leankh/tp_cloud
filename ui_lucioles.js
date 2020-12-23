//
// Cote UI de l'application "lucioles"
//
// Auteur : G.MENEZ
// RMQ : Manipulation naive (debutant) de Javascript
//

function init() {
    //=== Initialisation des traces/charts de la page html ===
    // Apply time settings globally
    Highcharts.setOptions({
	global: { // https://stackoverflow.com/questions/13077518/highstock-chart-offsets-dates-for-no-reason
            useUTC: false,
            type: 'spline'
	},
	time: {timezone: 'Europe/Paris'}
    });
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    chart4 = Highcharts.chart('container1', {
        chart: {
          type: 'spline',
          scrollablePlotArea: {
            minWidth: 600,
            scrollPositionX: 1
          }
        },
        title: {
          text: 'Temperature Corporelle',
          align: 'left'
        },
        subtitle: {
          text: today + '- M1 Info IOT',
          align: 'left'
        },
        xAxis: {
          type: 'datetime',
          labels: {
            overflow: 'justify'
          }
        },
        yAxis: {
          title: {
            text: 'Deg °C'
          },
          min : 10,
          max : 25,
          minorGridLineWidth: 0,
          gridLineWidth: 0,
          alternateGridColor: null,
          plotBands: [{ 
            from: 10,
            to: 15,
            color: 'rgba(68, 170, 213, 0.1)',
            label: {
                text: 'Froid',
                style: {
                    color: '#606060'
                }
            }
        }, { 
            from: 15,
            to: 20,
            color: 'rgba(0, 0, 0, 0)',
            label: {
                text: 'Ambiante',
                style: {
                    color: '#606060'
                }
            }
        }, { 
            from: 20,
            to: 25,
            color: 'rgba(68, 170, 213, 0.1)',
            label: {
                text: 'Chaud',
                style: {
                    color: '#606060'
                }
            }
        }
        ]
    
         
        },
        
        tooltip: {
          valueSuffix: ' °C'
        },
        plotOptions: {
          spline: {
            lineWidth: 4,
            states: {
              hover: {
                lineWidth: 5
              }
            },
            marker: {
              enabled: false
            },
            
          }
        },
        series: [{
          name: 'ESP1',
          data: []
      
        }, {
          name: 'ESP2',
          data: [
           
          ]
        },
        {
            name: 'ESP3',
            data: [
             
            ]
          }],
        navigation: {
          menuItemStyle: {
            fontSize: '10px'
          }
        }
      });

    chart5 = Highcharts.chart('container2', {
        chart: {
          type: 'spline',
          scrollablePlotArea: {
            minWidth: 600,
            scrollPositionX: 1
          }
        },
        title: {
          text: 'Luminosité du capteur',
          align: 'left'
        },
        subtitle: {
          text: today + '- M1 Info IOT',
          align: 'left'
        },
        xAxis: {
          type: 'datetime',
          labels: {
            overflow: 'justify'
          }
        },
        yAxis: {
          title: {
            text: 'Light (Lumen)'
          },
          min : 500,
          max : 2000,
          minorGridLineWidth: 0,
          gridLineWidth: 0,
          alternateGridColor: null, plotBands: [{ 
            from: 500,
            to: 1000,
            color: 'rgba(68, 170, 213, 0.1)',
            label: {
                text: 'Sombre',
                style: {
                    color: '#606060'
                }
            }
        }, { 
            from: 1000,
            to: 1500,
            color: 'rgba(0, 0, 0, 0)',
            label: {
                text: 'Lumineux',
                style: {
                    color: '#606060'
                }
            }
        }, { 
            from: 1500,
            to: 2000,
            color: 'rgba(68, 170, 213, 0.1)',
            label: {
                text: 'Très Lumineux',
                style: {
                    color: '#606060'
                }
            }
        }
        ]
    
         
        },
          
        
        tooltip: {
          valueSuffix: ' lum'
        },
        plotOptions: {
          spline: {
            lineWidth: 4,
            states: {
              hover: {
                lineWidth: 5
              }
            },
            marker: {
              enabled: false
            },
          }
        },
        series: [{
          name: 'ESP1',
          data: [
            
          ]
      
        }, {
          name: 'ESP2',
          data: [
           
          ]
        }, {
            name: 'ESP3',
            data: [
             
            ]
          }],
        navigation: {
          menuItemStyle: {
            fontSize: '10px'
          }
        }
      });

      
    //=== Gestion de la flotte d'ESP =================================
    var which_esps = [
    "24:6F:28:22:72:B8",
    "30:AE:A4:8C:04:64",
      "80:7D:3A:FD:E8:E8"
    ]
    
    for (var i = 0; i < which_esps.length; i++) {
	process_esp(which_esps, i)
    }
};


//=== Installation de la periodicite des requetes GET============
function process_esp(which_esps,i){
    const refreshT = 10000 // Refresh period for chart
    esp = which_esps[i];    // L'ESP "a dessiner"
    //console.log(esp) // cf console du navigateur
    
    // Gestion de la temperature
    // premier appel pour eviter de devoir attendre RefreshT
    get_samples('/esp/temp', chart4.series[i], esp);
    //calls a function or evaluates an expression at specified
    //intervals (in milliseconds).
    window.setInterval(get_samples,
		       refreshT,
		       '/esp/temp',     // param 1 for get_samples()
		       chart4.series[i],// param 2 for get_samples()
		       esp);            // param 3 for get_samples()

    // Gestion de la lumiere
    get_samples('/esp/light', chart5.series[i], esp);
    window.setInterval(get_samples,
		       refreshT,
		       '/esp/light',     // URL to GET
		       chart5.series[i], // Serie to fill
		       esp);             // ESP targeted
    
}


//=== Recuperation dans le Node JS server des samples de l'ESP et 
//=== Alimentation des charts ====================================
function get_samples(path_on_node, serie, wh){
    // path_on_node => help to compose url to get on Js node
    // serie => for choosing chart/serie on the page
    // wh => which esp do we want to query data
    
    //node_url = 'http://localhost:3000'
    //node_url = 'http://10.9.128.189:3000'
    node_url = 'http://192.168.1.28:3000'

    //https://openclassrooms.com/fr/courses/1567926-un-site-web-dynamique-avec-jquery/1569648-le-fonctionnement-de-ajax
    $.ajax({
        url: node_url.concat(path_on_node), // URL to "GET" : /esp/temp ou /esp/light
        type: 'GET',
        headers: { Accept: "application/json", },
	data: {"who": wh}, // parameter of the GET request
        success: function (resultat, statut) { // Anonymous function on success
            let listeData = [];
            resultat.forEach(function (element) {
            listeData.push([Date.parse(element.date),element.value]);
            console.log(" element value : " + element.value);
		//listeData.push([Date.now(),element.value]);
            });
         //   console.log("last element : " +  listeData.slice(-1)[0] )
            serie.setData(listeData); //serie.redraw();
        },
        error: function (resultat, statut, erreur) {
        },
        complete: function (resultat, statut) {
        }
    });
}



//assigns the onload event to the function init.
//=> When the onload event fires, the init function will be run. 
window.onload = init;


