//visual variables
let moire1;
let moire2;
let moire3;
let moire4;

let graphics1;
let s1;
let s2;
let rand = 0.0;
let leftBorder;

let d;
let h;

// instrument and sound variables
let amOsc;
let oscfat;
let lfo;
let pluckSynth;
let cymbalSynth;
let bassSynth;
let synth1;
let amSynth;
let fmSynth;
let masterVolume;
let counter;
let vol;
let loopBeat;

// motion tracking variables
let video;     // webcam input
let model;     // PoseNet machine-learning model
let poses;  // detected skeleton
let firstSkeleton = true;


function setup() {
  // create new display
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
 
  // make new graphics element for visual display
  graphics1 = createGraphics(windowWidth-400, windowHeight);
  graphics1.colorMode(HSB);
  graphics1.ellipseMode(CENTER)
  graphics1.fill(255);

  // load the PoseNet model
  model = ml5.poseNet(video, {maxPoseDetections: 1 } );
  
  // when model finds pose, finds keypoints
  model.on('pose', function(predictions) {
    poses = predictions[0];
  });
  
  // new moire object declarations
  moire1 = new Moire();
  moire2 = new Moire();
  moire3 = new Moire();
  moire4 = new Moire();
  
  // master volume set
  vol = new Tone.Volume(-12).toDestination();
  
  // OSCILLATORS
  	amOsc = new Tone.AMOscillator({
      frequency: 50, 
      type: "sine",
      modulationType: "triangle",
      volume : -12
    }).toDestination();

   oscfat = new Tone.FatOscillator({
     frequency :100,
     type : "square",
     modulationType : "triangle",
     envelope : {
        attack : 0.001 ,
        decay : 0.01 ,
        sustain : 0.6 ,
        release : 0.9}
   }).toDestination(); 
  
  // counter for loop set to 0
  counter = 0;
  
  // SYNTHS for loop
  pluckSynth = new Tone.PluckSynth(
        {
      attackNoise : 0.1 ,
      dampening : 300 ,
      resonance : 0.8
        }).toDestination();
  
  synth1 = new Tone.Synth({
    oscillator: {
      type: "triangle",
      partialCount: 30, 
    },
    envelope: { //sets the various sound properties for the synth
      attack: 0.0001,
      decay: 0.0002,
      sustain: 0.2,
      release: 2,
  }
   }).toDestination();
  
  // lfo to control fatOsc frequency
   lfo = new Tone.LFO("0.8hz", 10, 130);
    //tremolo (careful with values: no bigger than 10)
    //vibratto
    lfo.start();
    //lfo.connect(synth1.frequency);
    lfo.connect(oscfat.frequency);
    // lfo.connect(fmOsc2.frequency);
  
  bassSynth = new Tone.MembraneSynth(
  {
      frequency : 80 ,
      envelope : {
      attack : 0.001 ,
      decay : 0.001, 
      sustain: 0.7,
      release : 0.4
      }
  }).toDestination();
  
  cymbalSynth = new Tone.MetalSynth({
    
      frequency : 250 ,
      envelope : {
      attack : 0.001 ,
      decay : 0.01 ,
      release : 0.01
      } ,
      harmonicity : 2.1 ,
      modulationIndex : 32 ,
      resonance : 6000 ,
      octaves : 2.0

  }).toDestination();
  
  fmSynth = new Tone.FMSynth({
        harmonicity : 1.03 ,
        modulationIndex : 3 ,
        detune : 0 ,
        oscillator : {
        type : "sine"
        } ,
        envelope : {
        attack : 0.001 ,
        decay : 0.01 ,
        sustain : 0.6 ,
        release : 0.9
        } ,
        modulation : {
        type : "square"
        } ,
        modulationEnvelope : {
        attack : 0.0005 ,
        decay : 0 ,
        sustain : 1 ,
        release : 0.5
        }
        }).toDestination();

  amSynth = new Tone.AMSynth({
        harmonicity : 3 , //adjust modulating frequency
        detune : 0 ,
        oscillator : {
        type : "sine"
        } ,
        envelope : {
        attack : 0.0001 ,
        decay : 0.5 ,
        sustain : 0.7 ,
        release : 0.8
        } ,
        modulation : {
        type : "triangle"
        } ,
        modulationEnvelope : {
        attack : 0.0005 ,
        decay : 0.001 ,
        sustain : 0.6 ,
        release : 0.5
        }
}).toDestination();

// function uses callback time to schedule events and create rhythmic backing track

loopBeat = new Tone.Loop(song, "13n").start(2);

}

function draw() {
  
  background(0);
  
  // mirror canvas from webcam input
  translate(width, 0);
  scale(-1.0, 1.0);

  // set up two image elements
  if (video.loadedmetadata) {
    image(video, 0,0);
    image(graphics1, 600, 0);
  }
  // if poses are estimated
  if (poses !== undefined) {
    Tone.Transport.start().bpm.value = 120;
    masterVolume = -10;
    Tone.Destination.volume.value = masterVolume;

    if (firstSkeleton) {
      console.log(poses);
      firstSkeleton = false;
    }
    
    fill(255);
    noStroke();
    
  // iterates through poses and places circle on 17 keypoints
    for (let pt of poses.pose.keypoints) {

      pt = scalePoint(pt.position);
      //console.log(pt);
      circle(pt.x, pt.y, 20);
    }
    
    
    // specific keypoint declarations
    let leftWrist =  poses.pose.leftWrist;
    let rightWrist = poses.pose.rightWrist;
    
    let nose = poses.pose.nose;
    
    let leftAnkle = poses.pose.leftAnkle;
    let rightAnkle = poses.pose.rightAnkle;
    
    let leftHip = poses.pose.leftHip;

    drawSkeleton();           
    graphics1.background(0);
    
    
  // NOSE KEYPOINT
  // only display if the nose keypoint confidence score is high enough
    
    if (nose.confidence > 0.3) {
  // control moire object 3
      moire3.graphicsMoire(nose.x, nose.y-180, 500, h+130, 100, 100);
      push();
      fill(0,0,255);
      circle(nose.x, nose.y, 30);
      pop();
      
  //change hue as nose keypoint moves left to right
      hueChange(nose.x);
      
    } else  {
      rand += 0.01;
      h = floor(noise(rand) * 360.0);
    }
    
    
  // HIP KEYPOINT
  // only display if the leftHip keypoint confidence score is high enough
    if (leftHip.confidence > 0.2) {

      let lh = createVector(leftHip.x, leftHip.y);
      lh = scalePoint(lh);
      
      leftBorder = createVector(video.width-30, leftHip.y);
      lb = scalePoint(leftBorder);       
     
      stroke(191, 112, 255);
      strokeWeight(6);
      line(lh.x, lh.y, lb.x, lb.y);
      
      let hipX = (lb.x + lh.x)*0.75;
      
  // control moire object 4
      moire4.graphicsMoire(hipX, leftHip.y, 650, 283, 30, 100);

    }

    
  // WRIST KEYPOINTS
  // only display if the wrist keypoints confidence scores are high enough
    
    if (rightWrist.confidence > 0.2 && leftWrist.confidence > 0.2) {
      
  // take wrist coordinates and create vector
      let l = createVector(leftWrist.x, leftWrist.y);
      l = scalePoint(l);
      let r = createVector(rightWrist.x, rightWrist.y);
      r = scalePoint(r);
      
  // draw coloured line between wrists
      stroke(255,0,0);
      strokeWeight(6);
      line(l.x, l.y, r.x, r.y);

  // use dist() function to calculate measurement between points
      d = l.dist(r); 
      let md = d/2;
      
      let wristX = (l.x + r.x) / 2;
      let wristY = (l.y + r.y) / 2;
      
      s1 = map(d, 0, 500, 500, 1400);
      
  // control moire object 1
      moire1.graphicsMoire(wristX, wristY, s1, 0, 100, 100);
  
  // map amOsc frequency and volume to distance between wrist keypoints
      amOsc.frequency.value = map(d, 1, 300, 40.0, 250.0);

      let volC = map(d, 1, 300, -50, -12);
      amOsc.volume.value = constrain(volC, -50, -10);
      amOsc.connect(vol).start();

      noStroke();
    }
    else  {
  // if confidence score too low, turn off
      amOsc.stop();
    }
    
    
  // ANKLE KEYPOINTS
  // only display if the ankle keypoints confidence scores are high enough
    
    if (leftAnkle.confidence > 0.2 && rightAnkle.confidence > 0.2) 
    
    {
  // take ankle coordinates and create vector

      let lv = createVector(leftAnkle.x, leftAnkle.y);
      la = scalePoint(lv);
      let rv = createVector(rightAnkle.x, rightAnkle.y);
      ra = scalePoint(rv); 
      
  // draw coloured line between ankles
      stroke(0,255,0);
      strokeWeight(6);
      line(la.x, la.y, ra.x, ra.y);
  
  // use dist() function to calculate measurement between points
      da = la.dist(ra);
      let md = da/2;

      let ankleX = (la.x + ra.x) / 2;
      let ankleY = (la.y + ra.y) / 2;

      s2 = map(da, 0, 500, 500, 1400);
      
  // control moire object 2
      moire2.graphicsMoire(ankleX, ankleY, s2, 113, 100, 100);
  
  // map oscfat volume to distance between ankle keypoints

      let volC = map(da, 1, 300, -50, -8);
      oscfat.volume.value = constrain(volC, -50, -10);
      lfo.start();
      oscfat.connect(vol).start();
      
      noStroke();

    } else {
  // if confidence score too low, turn off
      oscfat.stop();
    }
  }
}

// draw skeleton outline of user
function drawSkeleton() {
      for (let ptLine of poses.skeleton) {

      let partA = ptLine[0];
      let partB = ptLine[1];
      stroke(255);
      
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);      
        
      fill(255);
      }
  }



// function to change keypoints to vectors
function scalePoint(pt) {

  let x =  pt.x;
  let y = pt.y;
  return createVector(x, y);
}



// function to change hue 
function hueChange(y) {
  h = map(y, 800, 0, 170, 10);
}



// rhythmic background loop function
// specific synth nodes triggered at specific times with selected pitches

function song(time) {
   if (counter%4 === 0) {
   bassSynth.triggerAttackRelease("C0", "16n", time, 0.7);
   }
  
  if (counter % 4 !== 1) {

    if (counter === 3 || counter === 12) {
      cymbalSynth.envelope.decay = 0.4;

    } else {
      cymbalSynth.envelope.decay = 0.01;

    }
    cymbalSynth.triggerAttackRelease("A0", "32n", time, 0.3);
 
  }
  
  if (counter%4 === 0) {
    pluckSynth.triggerAttackRelease("A2", "16n", time, 0.02);

  } else {
   pluckSynth.triggerAttackRelease("C2", "32n", time, 0.2);
   
  }
  
   if (counter === 0) {
    amSynth.triggerAttackRelease("C2", "8n", time, 1);
      
  }
  if (counter === 10) {
    amSynth.triggerAttackRelease("D2", "16n", time, 1);
  }
   if (counter === 4) {
    fmSynth.triggerAttackRelease("C1", "16n", time, 1);
  }
  if (counter === 12) {
    fmSynth.triggerAttackRelease("C2", "16n", time, 1);
  }
  
  counter = (counter+1)%16;
}


