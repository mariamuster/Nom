if (this.level === 1) {
  hitboxWidth *= 4; 
  hitboxHeight *= 0.9; 
  //CAR
} else if (this.level === 2) {
  hitboxWidth *= 2; 
  hitboxHeight *= 0.8; 
  offsetY = -this.size * 0.8; 
  offsetX = this.size*4; 
  //METEOR
} else if (this.level === 3) {
  offsetY = -this.size * 0.8; 
  offsetX = this.size*4;  
  //LION    
} else if (this.level === 4) {
  offsetY =-this.size; 
  offsetX = this.size*4;
}
