#pragma strict

//New variables!!
var cameraZoomRate : float = 6.0;
var cameraOffset : Vector3 = Vector3(0,0,0);
var playerForce : float;
var reticle : Transform;
private var cameraHistory = new Array();
//-----


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

// private var aimPositions = Vector2[100];
function Start () {
	lastPosition = transform.position;
	gunSound = gameObject.GetComponent(AudioSource);
	cameraHistory.push(transform.position);
}

function MovePlayer(isPlayerAiming : boolean) {
	var adjustedSpeed = playerForce;
	if (isPlayerAiming) {
		adjustedSpeed = playerForce * 0.5;
	}
	rigidbody.AddForce(x * adjustedSpeed * Time.deltaTime , 0,y * adjustedSpeed * Time.deltaTime, ForceMode.Impulse);
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
	//changing the size of the camera is the only way to change the zoom on ortho cams. If this were
	//a perspective cam, we'd want to adjust the actually Y distance from the game plane.
	cam.orthographicSize = Mathf.MoveTowards(cam.orthographicSize, zoomAmount, zoomRate * Time.deltaTime);
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
				var bulletShake : Vector3 = reticle.right * Random.Range(0.05,0.25) * -1.0;
				Fire(weaponSpread, baseFireRate, isAiming);
			} else {
				Fire(0.5, baseFireRate * 3.0, isAiming);
			}
			//Shake the camera in the opposite direction that the bullets are firing
			//out of (hence the multiply by negative one). Random.Range is the force
			//we are going to push back. Making it random gives it a more natural feel
		}
	}
	cameraTransformThisFrame.x = transform.position.x + (rigidbody.velocity.x / 4.0);
	cameraTransformThisFrame.z = transform.position.z + (rigidbody.velocity.z / 2.0);

	//try adding in the aiming
	if (isReticleVisible) {
		cameraTransformThisFrame.x += reticle.right.x * retDot.localPosition.x * 0.5;
		cameraTransformThisFrame.z += reticle.right.z * retDot.localPosition.z * 0.5;

	};
	cameraHistory.push(cameraTransformThisFrame);
	var newCameraPosition : Vector3 = CalculateAveragedCamera(cameraHistory, 20);
	cam.transform.position.x = newCameraPosition.x;
	cam.transform.position.z = newCameraPosition.z;
	cam.transform.position += bulletShake;
	cam.transform.position += cameraOffset;
	//@todo Checking user input on FixedUpdate hurts puppies. Don't do it. Well, unless you hate puppies.
	//Oh god, why do you hate puppies??!?!
	MovePlayer(isAiming && isReticleVisible);

	//REMOVE THIS
	// if (Input.GetButtonDown('Jump')) {
	// 	rigidbody.AddForce(Vector3.up * 300, ForceMode.Impulse);
	// };

};

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
    var clone : GameObject = Instantiate(bullet, reticle.position, rot);
    yield WaitForSeconds(fireRate);
    allowFire = true;
}