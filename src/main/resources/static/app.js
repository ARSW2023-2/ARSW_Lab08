var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    //var dibujoId = null;
    var numdibujo = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    var addPolygonToCanvas = function (points) {
		let c2 = canvas.getContext('2d');
		let init = false;
		
		c2.fillStyle = '#f00';
        c2.beginPath();
        points.map(function (value, index ){
			if (!init){
				c2.moveTo(value.x,value.y);
				init = true;
			} else {
				c2.lineTo(value.x,value.y);
			} 
        });
		c2.closePath();
		c2.fill();
	};
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (numdibujo) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint' + numdibujo, function (eventbody) {
                let  jsonObj = JSON.parse(eventbody.body);
                //alert("Cordenadas recibidas: " + jsonObj.x + ", " + jsonObj.y); 
                addPointToCanvas(new Point(jsonObj.x, jsonObj.y));
                
            });
            stompClient.subscribe('/topic/newpolygon/'+ numdibujo, function (eventbody){
				addPolygonToCanvas(JSON.parse(eventbody.body));
			});
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            var context = canvas.getContext("2d");

            if(window.PointerEvent) {
                canvas.addEventListener("pointerdown", function(event){
                    let mousePosition = getMousePosition(event);
                    app.publishPoint(mousePosition.x, mousePosition.y);
                });
            }else{
                canvas.addEventListener("mousedown", function(event){
                    let mousePosition = getMousePosition(event);
                    app.publishPoint(mousePosition.x, mousePosition.y);
                });
            }
            
            //websocket connection
            //connectAndSubscribe();
            numdibujo = parseInt(document.getElementById("dibujoId").value);
            if(isNaN(numdibujo)){
                alert("El id del dibujo debe ser un numero");
            }else{
                alert("El id del dibujo es: " + numdibujo);
                can.getContext("2d").clearRect(0, 0, 800, 600);
                connectAndSubscribe(numdibujo);
            }
        },

        publishPoint: function(px,py){
            if(dibujoId==null){
                alert("Debe seleccionar un dibujo");
            }else{
                var pt=new Point(px,py);
                console.info("publishing point at "+pt);
                //addPointToCanvas(pt);

                //publicar el evento
                //creando un objeto literal
                //stompClient.send("/topic/newpoint" + dibujoId, {}, JSON.stringify(pt));
                stompClient.send("/app/newpoint." + numdibujo, {}, JSON.stringify(pt));
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();