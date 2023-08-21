class Moire {

  graphicsMoire(x, y, s1, h, sat, bri) {
      for(let i=0;i<s1;i+=20){
        
       graphics1.noFill();
       graphics1.stroke(h, sat, bri);
       graphics1.strokeWeight(5);
       graphics1.ellipse(x+200,y+400,i-40,i-40);
    }
  }
}