#pragma strict
var speed = 1.0;
var lazerHitObject : GameObject;

function Start () {
	yield WaitForSeconds(3);
	Destroy (gameObject);
}

function OnBecameInvisible () {
  Destroy(gameObject);
}

function Update () {
	transform.Translate(speed * Time.deltaTime, 0, 0 );
}

function OnCollisionEnter(collision : Collision) {
	var tag = collision.gameObject.tag;
	if (tag != "Bullet" && tag != "Ignore") {
		var rot =  Quaternion.identity;
		rot.eulerAngles.x = 90.0;
		Instantiate(lazerHitObject, transform.position,rot);
		Destroy (gameObject);
	}
}