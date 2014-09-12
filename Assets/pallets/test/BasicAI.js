#pragma strict

//New variables!!
var playerForce : float;
var reticle : Transform;

var jumpForce : float = 300.0;
var muzzle : Transform;
//-----


var bullet : GameObject;
var weaponSpread = 0.01;

private var allowFire = true;
private var lastPosition : Vector3;
private var gunSound : AudioSource;
var baseFireRate : float = 0.09;
private var x : float;
private var y : float;
private var doFire = false;
//AI variables
private var player : GameObject;


var rootMaterialObj : GameObject;
private var rootMaterial : Material;
var explosionBit : GameObject;
var health = 200;

// private var aimPositions = Vector2[100];
function Start () {
	player = GameObject.Find ("Player");
	gunSound = gameObject.GetComponent(AudioSource);
	rootMaterial = rootMaterialObj.renderer.material;

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
	@function CalculateReticleRotation
	@param transform reticleObjectToSet Pass in a transform that we want to set the rotation of
	@description The rotation this function sets is the rotation around the current player object,
	like how the moon rotates around the Earth. Make sense? Of course it does.
*/
// function CalculateReticleRotation(reticleObjectToSet : Transform) {
// 	var rotX = Input.GetAxis("LookHorizontal");
// 	var rotY = Input.GetAxis("LookVertical");
// 	var reticleRotation = Quaternion.identity;
// 	//Do some trig magic. I didn't write this, otherwise I'd explain how it works, but trust me
// 	//when I say, it's trig and it appears to work.
// 	reticleRotation.eulerAngles = new Vector3(0, Mathf.Atan2( rotY, rotX ) * 180 / Mathf.PI, 0 );
// 	reticleObjectToSet.rotation = reticleRotation;
// 	return reticleObjectToSet.rotation;
// }

function Update() {
		rootMaterial.color = Color.Lerp(rootMaterial.color, Color.white, Time.deltaTime * 2.0);
}

function FixedUpdate() {
	if (player) {

	
		var isReticleVisible = false;
		
		//Set global values. Yeah, I'm not happy about it either, but that's life, and life sucks.
		// x = Input.GetAxis("Horizontal");
		// y = Input.GetAxis("Vertical");

		//FIXED - Instead of polling the "Aim" axis *inside* of our targeting block, let's poll it
		//*before* and pass the value in later. The advantage? Well, if you aren't stop targeting
		//while aiming, the isAiming bool will be stuck to true, making the player move slowly
		//even though she isn't aiming, and well, that's stupid.
		//Also fixed, let's not make this global. Globals are why the world is a sad place.
		// var isAiming = Input.GetButton('Aim');
		var isAiming = false;
		//Accounting for joystick deadspace, poll the axis and if it looks like the user is trying to
		//do something, trigger our actions (see all below)
		// var reticleRotation = CalculateReticleRotation(reticle);

		// if (Mathf.Abs(Input.GetAxis("LookHorizontal")) < 0.005 && Mathf.Abs(Input.GetAxis("LookVertical")) < 0.005) {
			// ShowReticle(false);
			// isReticleVisible = false;
			// ZoomTo(cameraCloseIn, cameraZoomRate);
		// } else {
			// ShowReticle(true);
			// isReticleVisible = true;
			// CalculateReticleRotation(reticle);


			if (doFire && allowFire) {
				gunSound.Play();
				if (!isAiming) {
					//@todo Make bullet shake dynamic!
					Fire(weaponSpread, baseFireRate, isAiming);
				} else {
					Fire(0.5, baseFireRate * 3.0, isAiming);
				}
			}
		// }

		//@todo Checking user input on FixedUpdate hurts puppies. Don't do it. Well, unless you hate puppies.
		//Oh god, why do you hate puppies??!?!
		// if (Mathf.Approximately(x,0.0) == false || Mathf.Approximately(y,0.0) == false) {
		// MovePlayer(isAiming && isReticleVisible);
		reticle.LookAt(player.transform);
		reticle.eulerAngles.y += 270;
		var distance = Vector3.Distance(transform.position, player.transform.position);
		if (distance > 8.0) {
			doFire = false;
			var adjustedSpeed = playerForce;
			if (isAiming) {
				adjustedSpeed = playerForce * 0.5;
			}
			var moveVector = player.transform.position - transform.position; 
			rigidbody.AddForce(moveVector.x * adjustedSpeed * Time.deltaTime , 0, moveVector.z * adjustedSpeed * Time.deltaTime, ForceMode.Impulse);
			if (rigidbody.velocity.magnitude > 3.5) {
				rigidbody.velocity = Vector3.ClampMagnitude(rigidbody.velocity, 3.5);
			}
		} else if (distance < 10) {
			doFire = true;
		}
		// } else {
			// rigidbody.velocity = Vector3(0,0,0);
		// }

		//REMOVE THIS
		// if (Input.GetButtonDown('Jump')) {
		// 	rigidbody.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
		// };
	}

};

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
		rootMaterial.color = Color.black;

		if (health <= 0) {
			for (var k =0; k < 90; k++) {
				var boom = Instantiate(explosionBit, transform.position, Random.rotation);
				boom.rigidbody.AddRelativeForce(boom.transform.forward * Random.Range(4.0,80.0));
			}
			Destroy (gameObject);
		}	
	}	
}