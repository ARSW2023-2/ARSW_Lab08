package edu.eci.arsw.collabpaint.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class StompMessagesHandler {

    private static final int POLYGON_LIMIT = 4;

    @Autowired
	private SimpMessagingTemplate msgt;

    private ConcurrentMap<String, List<Point>> pointMap;

	
	public StompMessagesHandler() {
		pointMap = new ConcurrentHashMap<String, List<Point>>();
	}
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
		System.out.println("Nuevo punto recibido en el servidor!:"+pt);
		msgt.convertAndSend("/topic/newpoint"+numdibujo, pt);

        if (!pointMap.containsKey(numdibujo)) {
			pointMap.put(numdibujo, new ArrayList<Point>());
		}
		
		List<Point> points = pointMap.get(numdibujo);
		points.add(pt);
		
		synchronized (points) {
			if (points.size() >= POLYGON_LIMIT) {
				System.out.println("¡Dibujando nuevo polígono en el servidor!");
				msgt.convertAndSend("/topic/newpolygon/"+numdibujo, points);
				points.clear(); 
			}
		}
		
	}
    
}
