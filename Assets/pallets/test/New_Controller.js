#pragma strict
var ignore = false;

//New variables!!
var cameraZoomRate : float = 6.0;
var cameraOffset : Vector3 = Vector3(0,0,0);
var playerForce : float;
var reticle : Transform;
private var cameraHistory = new Array();
private var pointsOfInterestOuter = new Array();
private var pointsOfInterestInnter : Vector3;
var jumpForce : float = 300.0;
var muzzle : Transform;

private var zoomHistory = new Array();
//-----

//TEST VARIABLE
var mapWidth : int = 10;
var mapHeight : int = 10;
//------

var retDot : Transform;
var bullet : GameObject;
var weaponSpread = 0.01;
var cam : Camera;
var cameraCloseIn = 4.0;
var cameraSlightlyOut = 6.0;
var cameraCompletelyOut = 10.0;
private var allowFire = true;
private var lastPosition : Vector3;
private var gunSound : AudioSource;
var baseFireRate : float = 0.09;
private var x : float;
private var y : float;
var rootMaterialObj : GameObject;
private var rootMaterial : Material;
private var defaultColor : Color;
var explosionBit : GameObject;
var health = 200;
private var maxHealth : int;


private var currentZoom : float;

// private var aimPositions = Vector2[100];
function Start () {
	currentZoom = cameraCloseIn;
	lastPosition = transform.position;
	gunSound = gameObject.GetComponent(AudioSource);
	cameraHistory.push(transform.position);
	rootMaterial = rootMaterialObj.renderer.material;
	defaultColor = rootMaterial.color;
	maxHealth = health;
	Heal();
}

function Heal() {
	while (true) {
		if (health < maxHealth) {
			health++;
		}
		yield WaitForSeconds (1);
	}
}

function MovePlayer(isPlayerAiming : boolean) {
	var adjustedSpeed = playerForce;
	if (isPlayerAiming) {
		adjustedSpeed = playerForce * 0.5;
	}
	rigidbody.AddForce(x * adjustedSpeed * Time.deltaTime , 0,y * adjustedSpeed * Time.deltaTime, ForceMode.Impulse);
	if (rigidbody.velocity.magnitude > 3.5) {
		rigidbody.velocity = Vector3.ClampMagnitude(rigidbody.velocity, 3.5);
	}
	// yield WaitForFixedUpdate;
	// rigidbody.velocity = Vector3.ClampMagnitude(rigidbody.velocity, 3.5);
};

/**
	@function ShowReticle
	@param boolean reticleVisibilty The state the reticle's visibilty should be set to
	@description Yes, you're right. It does seem like a really simple function, so why bother?
	Well, I'm glad you asked (what do you mean you didn't ask and you're just trying to debug some
	poorly coded game and you're sick of the snarky comments?). By wrapping this logic into its own
	function, we can, in the future, swap out the reticle object easily without hunting through billions
	(I'm assuming this game is going to really grow soon) lines of code. Also, this should be its 
	own module, right?
*/
function ShowReticle(reticleVisibilty) {
	//Pull in a global. I know, I hate me, too.
	reticle.gameObject.SetActive(reticleVisibilty);
	return reticleVisibilty;
}

/**
	@function Zoom
	@param float zoomAmount The absolute amount we want to change the cam size
	@param float zoomRate An *un-normalized* value that will determine how fast we zoom
	@description This purpose of this should be pretty clear. Consider moving this out into its
	own module.
*/
function ZoomTo(zoomAmount : float, zoomRate : float) {
	//By calculating how much distance we need to cover, we can help normalize the speed
	//that the zoom needs to happen. That is, if we are zooming from camWayOut to camIn, we
	//will want to zoom *faster* than from camOut to camIn. This creates a smoother, more 
	//consitent feel
	var camDistance = Mathf.Abs(cam.orthographicSize - zoomAmount);
	zoomRate = zoomRate * camDistance;
	zoomHistory.push(zoomAmount);

	if (zoomHistory.length > 100) {
		zoomHistory.Shift();
	};
	var zoomTotal = 0.0;

	for (var k = 0; k < zoomHistory.length; ++k) {
		var thisZoom : float = zoomHistory[k];
		zoomTotal += thisZoom;
	};
	var finalZoom = zoomTotal / zoomHistory.length;

	//changing the size of the camera is the only way to change the zoom on ortho cams. If this were
	//a perspective cam, we'd want to adjust the actually Y distance from the game plane.
	cam.orthographicSize = finalZoom;

	// cam.orthographicSize = Mathf.MoveTowards(cam.orthographicSize, finalZoom, zoomRate * Time.deltaTime);
	currentZoom = cam.orthographicSize;
	return zoomAmount;
}

/**
	@function CalculateReticleRotation
	@param transform reticleObjectToSet Pass in a transform that we want to set the rotation of
	@description The rotation this function sets is the rotation around the current player object,
	like how the moon rotates around the Earth. Make sense? Of course it does.
*/
function CalculateReticleRotation(reticleObjectToSet : Transform) {
	var rotX = Input.GetAxis("LookHorizontal");
	var rotY = Input.GetAxis("LookVertical");
	var reticleRotation = Quaternion.identity;
	//Do some trig magic. I didn't write this, otherwise I'd explain how it works, but trust me
	//when I say, it's trig and it appears to work.
	reticleRotation.eulerAngles = new Vector3(0, Mathf.Atan2( rotY, rotX ) * 180 / Mathf.PI, 0 );
	reticleObjectToSet.rotation = reticleRotation;
	return reticleObjectToSet.rotation;
}

function OnTriggerEnter(other : Collider) {
	if ( other.tag == 'POI_Outer') { 
		// var poiComponent : PointOfInterest = other.gameObject.GetComponent(PointOfInterest);
		// var innerBias : float = poiComponent.innerBias;
		// var outerBias : float = poiComponent.outerBias;
		// var distance : float = Vector3.Distance(transform.position, other.transform.position);
		pointsOfInterestOuter.push({ "position" : other.transform.position , "object" : other.gameObject});
	};
};

function OnTriggerExit(other : Collider) {
	var colliderObject = other.gameObject;
	for (var k = 0; k < pointsOfInterestOuter.length; k++ ) {
		var currentObjectHash : Hashtable = pointsOfInterestOuter[k];
		var currentObject : GameObject = currentObjectHash["object"];
		if (currentObject == colliderObject) {
			pointsOfInterestOuter.RemoveAt(k);
		}
	}
}

function Update() {
	rootMaterial.color = Color.Lerp(rootMaterial.color, defaultColor, Time.deltaTime * 2.0);

	var updatedPoiArray = new Array();
	for (var k = 0; k < pointsOfInterestOuter.length; k++ ) {
		var currentObjectHash : Hashtable = pointsOfInterestOuter[k];
		var currentObject : GameObject = currentObjectHash["object"];
		if (!currentObject) {
			pointsOfInterestOuter.RemoveAt(k);
			continue;
		}
		
		var poiComponent : PointOfInterest = currentObject.GetComponent(PointOfInterest);
		var bias : float;
		var innerRadius : float = poiComponent.GetInnerRadius();
		var outerRadius : float = poiComponent.GetOuterRadius();
		var distance : float = Vector3.Distance(transform.position, currentObject.transform.position) - innerRadius;
		//Bi - (Bo * (d - i) ^ 2)

	 	// bias = poiComponent.innerBias - (poiComponent.outerBias * (distance * distance));
	 	// (p-i)/(o-i)=Bc
	 	var d = Vector3.Distance(transform.position, currentObject.transform.position);
	 	bias = 1.0 - ((d - innerRadius) / (outerRadius - innerRadius));
	 	var showLetterbox = poiComponent.showLetterbox;
	 	// Debug.Log(bias);
		// if (distance <= radius) {
		// 	bias = poiComponent.innerBias;
		// } else {
		// 	bias = poiComponent.outerBias;
		// }
		updatedPoiArray.push({ "position" : currentObject.transform.position , "object" : currentObject, "bias" : bias, "showLetterbox" : showLetterbox});
	}
	pointsOfInterestOuter = updatedPoiArray;
}

function FixedUpdate() {
	var isReticleVisible = false;
	var cameraTransformThisFrame : Vector3;
	//Debug section
	//First, show the players velocity
	Debug.DrawLine (transform.position, transform.position + rigidbody.velocity, Color.red);
	Debug.DrawLine (transform.position, transform.position + reticle.right, Color.blue);


	//Set global values. Yeah, I'm not happy about it either, but that's life, and life sucks.
	x = Input.GetAxis("Horizontal");
	y = Input.GetAxis("Vertical");

	//FIXED - Instead of polling the "Aim" axis *inside* of our targeting block, let's poll it
	//*before* and pass the value in later. The advantage? Well, if you aren't stop targeting
	//while aiming, the isAiming bool will be stuck to true, making the player move slowly
	//even though she isn't aiming, and well, that's stupid.
	//Also fixed, let's not make this global. Globals are why the world is a sad place.
	var isAiming = Input.GetButton('Aim');

	//Accounting for joystick deadspace, poll the axis and if it looks like the user is trying to
	//do something, trigger our actions (see all below)
	var reticleRotation = CalculateReticleRotation(reticle);

	if (Mathf.Abs(Input.GetAxis("LookHorizontal")) < 0.005 && Mathf.Abs(Input.GetAxis("LookVertical")) < 0.005) {
		ShowReticle(false);
		isReticleVisible = false;
		ZoomTo(cameraCloseIn, cameraZoomRate);
	} else {
		ShowReticle(true);
		isReticleVisible = true;
		CalculateReticleRotation(reticle);

		if (isAiming && isReticleVisible) {
			//@todo Make this zoom out rate a variable that's visible to the inspector
			retDot.localPosition.x = Mathf.Lerp(retDot.localPosition.x, 9.0, Time.deltaTime * 5.0);
			ZoomTo(cameraCompletelyOut, cameraZoomRate);
		} else {
			retDot.localPosition.x = Mathf.Lerp(retDot.localPosition.x, 5.0, Time.deltaTime * 5.0);
			ZoomTo(cameraSlightlyOut, cameraZoomRate);
		}

		if ((Input.GetAxis('RightTrigger') > 0 || Input.GetAxis('LeftTrigger') > 0) && allowFire) {
			gunSound.Play();
			if (!isAiming) {
				//@todo Make bullet shake dynamic!
				var bulletShake : Vector3 = reticle.right * Random.Range(0.02,0.07) * -1.0;
				Fire(weaponSpread, baseFireRate, isAiming);
			} else {
				Fire(0.5, baseFireRate * 3.0, isAiming);
			}
			//Shake the camera in the opposite direction that the bullets are firing
			//out of (hence the multiply by negative one). Random.Range is the force
			//we are going to push back. Making it random gives it a more natural feel
		}
	}
	//this line factors in aspect ratio
	// cameraTransformThisFrame.x = transform.position.x + (rigidbody.velocity.x / 1.25);
	//this line does not
	cameraTransformThisFrame.x = transform.position.x + (rigidbody.velocity.x * 0.15);
	cameraTransformThisFrame.z = transform.position.z + (rigidbody.velocity.z * 0.15);

	//try adding in the aiming
	if (isReticleVisible) {
		cameraTransformThisFrame.x += reticle.right.x * retDot.localPosition.x * 0.5;
		cameraTransformThisFrame.z += reticle.right.z * retDot.localPosition.z * 0.5;

	};


	//This block of code will focus on the closest
	// if (pointsOfInterestOuter.length > 0) {
	// 	var closestDistance : float = Mathf.Infinity;
	// 	var closestPoint : Vector3;
	// 	var closestBias = 0.0;
	// 	for (var k = 0; k < pointsOfInterestOuter.length; k++) {
	// 		var poi : Hashtable = pointsOfInterestOuter[k];
	// 		var poiPosition : Vector3 = poi["position"];
	// 		if (Vector3.Distance(transform.position, poiPosition) < closestDistance) {
	// 			closestBias = poi["bias"];
	// 			closestPoint = poiPosition;
	// 		}
	// 	}
	// 	//average them out
	// 	// var averagedPoiPoint : Vector3 = totalPoiPoints / pointsOfInterestOuter.length;
	// 	closestPoint.y = cam.transform.position.y;
	// 	// var dist = Vector3.Distance(averagedPoiPoint, transform.position);
	// 	cameraTransformThisFrame = Vector3.Lerp(cameraTransformThisFrame, closestPoint, closestBias);
	// }

	//This block of code averages all that you can see
	// if (pointsOfInterestOuter.length > 0) {
	// 	var totalPoiPoints : Vector3;
	// 	var maxBias = 0.0;
	// 	for (var k = 0; k < pointsOfInterestOuter.length; k++) {
	// 		var poi :Hashtable = pointsOfInterestOuter[k];
	// 		var poi_position : Vector3 = poi["position"];
	// 		var bias : float = poi["bias"];
	// 		maxBias = Mathf.Max(bias, maxBias);
	// 		totalPoiPoints += poi_position;
	// 	};
	// 	//average them out
	// 	var averagedPoiPoint : Vector3 = totalPoiPoints / pointsOfInterestOuter.length;
	// 	averagedPoiPoint.y = cam.transform.position.y;
	// 	var dist = Vector3.Distance(averagedPoiPoint, transform.position);
	// 	cameraTransformThisFrame = Vector3.Lerp(cameraTransformThisFrame, averagedPoiPoint, maxBias);
	// }

	//This block doesn't bother averaging. Fuck it, just use all of them
	//@todo Push this outside of the update loop
	var screenHeight = cam.pixelHeight;
	var screenWidth = cam.pixelWidth;
	// var xBuffer = screenWidth * 0.1;
	// var yBuffer = screenHeight * 0.1;
	// // Debug.Log(cam.pixelHeight);
	// var xMin = xBuffer;
	// var xMax = screenWidth - xBuffer;
	// var yMin = yBuffer;
	// var yMax = screenHeight - yBuffer;
	var pos = cam.WorldToScreenPoint (transform.position);
	var xDistance = Mathf.Min(pos.x ,(cam.pixelWidth - pos.x));
	var yDistance = Mathf.Min(pos.y ,(cam.pixelHeight - pos.y));

	// Debug.Log(yDistance);
	var xClamp = xDistance / (cam.pixelWidth / 2.0);
	var yClamp = yDistance / (cam.pixelHeight / 2.0);
	var totalClamp = xClamp * yClamp;
	// Debug.Log(totalClamp);

	// 
	// if (pos.y > yMax || pos.y < yMin || pos.x < xMin || pos.x > xMax) {
		// var playerPosition = Vector3(transform.position.x, transform.position.y, transform.position.z + cameraOffset.z);
		// cameraTransformThisFrame = Vector3.Lerp(cameraTransformThisFrame, playerPosition, 0.01);

	// } else {
		if (pointsOfInterestOuter.length > 0) {
			for (var k = 0; k < pointsOfInterestOuter.length; k++) {
				var poi :Hashtable = pointsOfInterestOuter[k];
				var poiPosition : Vector3 = poi["position"];
				var bias : float = poi["bias"];
				// Debug.Log(poiPosition)
				var letterBox : boolean = poi["showLetterbox"];
				// ZoomTo(cameraCompletelyOut * bias, cameraZoomRate);
				//@todo This is dumb and Spencer is making me do it. Please remove this as soon as he isn't watching ;)
				// cam.orthographicSize = currentZoom + (bias / 5.0);

				ZoomTo(currentZoom + (bias / 1.0), cameraZoomRate);

				cameraTransformThisFrame = Vector3.Lerp(cameraTransformThisFrame, poiPosition, bias * totalClamp);
				// if (bias > 0.75 && letterBox) {
				// 	ShowLetterbox();
				// } else {
				// 	HideLetterbox();
				// }
				// maxBias = Mathf.Max(bias, maxBias);
				// totalPoiPoints += poi_position;

			}
		} else {
			cam.orthographicSize = currentZoom;
		}
	// }

	var newCameraPosition : Vector3 = CalculateAveragedCamera(cameraHistory, 40);


	// Debug.Log(Vector3.Distance(transform.position, cameraTransformThisFrame - cameraOffset));
	var layerMask = 1 << 10;
	var hitColliders = Physics.OverlapSphere(transform.position, 11.0, layerMask);
	if (hitColliders.length > 0) {
		var positions : Vector3;
		var maxDistance = 0.0;
		positions += transform.position;
		for (k = 0; k < hitColliders.length; k++) {
			positions += hitColliders[k].transform.position;
			maxDistance = Mathf.Max(maxDistance, Vector3.Distance(hitColliders[k].transform.position, transform.position));
		};
		// var zoomDistance = Mathf.Lerp(maxDistance, currentZoom, cameraZoomRate);
		ZoomTo(maxDistance + 2.0, cameraZoomRate);
		// currentZoom = zoomDistance;
		// Debug.Log(currentZoom);

		var endPoint = positions / ( hitColliders.length+1 );
		Debug.DrawLine(endPoint, transform.position);
		// cameraTransformThisFrame += endPoint;
	}


	var cameraLockedX = false;
	var cameraLockedZ = false;
	//Look at our position on the map. If we are falling off, then we need to just ignore all of the camera
	//stuff that we had planned for this frame
	var x = transform.position.x;
	var z = transform.position.z;

	cam.transform.position.x = Mathf.Lerp(cam.transform.position.x, newCameraPosition.x, 0.85);
	cam.transform.position.z = Mathf.Lerp(cam.transform.position.z, newCameraPosition.z, 0.85);
	if (z < -mapHeight || z > mapHeight) {
		cameraTransformThisFrame.z = cam.transform.position.z;
	} else {
		cameraTransformThisFrame.z += cameraOffset.z;
	}
	if (x < -mapWidth || x > mapWidth) {
		cameraTransformThisFrame.x = cam.transform.position.x;
	}

	cameraHistory.push(cameraTransformThisFrame);

	


	// if (pos.y > yMax || pos.y < yMin || pos.x < xMin || pos.x > xMax) {
		// Debug.Log(transform.position);
		// Debug.Log("Adjust");
		// Debug.Log(pos.z + "vs" + yBuffer);
		// Debug.Log(pos);
		// var itemsToRemove = cameraHistory.length * 0.75;
		// var playerPosition = Vector3(transform.position.x, transform.position.y, transform.position.z + cameraOffset.z);

		// for (k = 0; k < itemsToRemove; ++k) {
		// 	cameraHistory.shift();

		// 	cameraHistory.push(cam.transform.position);
		// };

	// } else {

	// }

	cam.transform.position += bulletShake;

	//@todo Checking user input on FixedUpdate hurts puppies. Don't do it. Well, unless you hate puppies.
	//Oh god, why do you hate puppies??!?!
	MovePlayer(isAiming && isReticleVisible);

	//REMOVE THIS
	// if (Input.GetButtonDown('Jump')) {
	// 	rigidbody.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
	// };

};

function ShowLetterbox() {
	cam.rect.height = Mathf.Lerp(cam.rect.height, 0.90, Time.deltaTime / 2.0);
	cam.rect.y =Mathf.Lerp(cam.rect.y, 0.05, Time.deltaTime / 2.0);
	// cam.rect = Rect(margin, 0, 1 - margin * 2, 1);
}

function HideLetterbox() {
	cam.rect.height = Mathf.Lerp(cam.rect.height, 1.0, Time.deltaTime / 2.0);
	cam.rect.y =Mathf.Lerp(cam.rect.y, 0, Time.deltaTime / 2.0);
}

function CalculateAveragedCamera (cameraPositionHistory : Array, cameraCountLimiter : int) : Vector3 {
	if (cameraPositionHistory.length > cameraCountLimiter) {
		cameraPositionHistory.Shift();
	};
	var totalPosition : Vector3;
	for (var k = 0; k < cameraPositionHistory.length; k++) {
		var tmpCamPos : Vector3 = cameraPositionHistory[k];
		totalPosition = totalPosition + tmpCamPos;
	};
	return totalPosition / cameraPositionHistory.length;

}

function Fire(spread : float, fireRate : float, isAiming : boolean) {
    allowFire = false;
    var rot = Quaternion.identity;
    rot.eulerAngles.y = reticle.rotation.eulerAngles.y;
    if (!isAiming) {
    	rot.eulerAngles.y += Random.Range(-spread,spread);
    } 
    var clone : GameObject = Instantiate(bullet, muzzle.position, rot);
    yield WaitForSeconds(fireRate);
    allowFire = true;
}


function OnCollisionEnter(collision : Collision) {
	var tag = collision.gameObject.tag;
	if (tag == "Bullet") {
			
	
		health--;
		// hitSound.Play();
		rootMaterial.color = Color.red;

		if (health <= 0) {
			for (var k =0; k < 90; k++) {
				var boom = Instantiate(explosionBit, transform.position, Random.rotation);
				boom.rigidbody.AddRelativeForce(boom.transform.forward * Random.Range(4.0,80.0));
			}
			Destroy (gameObject);
		}	
	}	
}
function ToggleIgnore() {
	yield WaitForSeconds(2);
	ignore = false;
}