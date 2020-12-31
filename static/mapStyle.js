const plantIcon = {
  scale: 4,
  fillOpacity: 1,
  strokeWeight: 0,
  outline: 0,
  path: "M7.5 0.5H8.5V2.5H10.5V3.5H8.5V5.5H7.5V3.5H5.5V2.5H7.5V0.5Z,M4.5 4.5V3.5H5.5V4.5H4.5Z,M3.5 5.5V4.5H4.5V5.5H3.5Z,M3.5 10.5H2.5V8.5H0.5V7.5H2.5V5.5H3.5V7.5H5.5V8.5H3.5V10.5Z,M4.5 11.5H3.5V10.5H4.5V11.5Z,M5.5 12.5H4.5V11.5H5.5V12.5Z,M10.5 12.5V13.5H8.5V15.5H7.5V13.5H5.5V12.5H7.5V10.5H8.5V12.5H10.5Z,M11.5 11.5V12.5H10.5V11.5H11.5Z,M12.5 10.5V11.5H11.5V10.5H12.5Z,M12.5 8.5V10.5H13.5V8.5H15.5V7.5H13.5V5.5H12.5V4.5H11.5V3.5H10.5V4.5H11.5V5.5H12.5V7.5H10.5V8.5H12.5Z"
};

const mapStyle = [
    {
        "featureType": "all",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "weight": "2.00"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#9c9c9c"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#7b7b7b"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#c8d7d4"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#070707"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    }
]