#pragma strict
var health = 10;
var rootMaterialObj : GameObject;
var explosionBit : GameObject;
private var hitSound : AudioSource;

private var rootMaterial : Material;

function Start () {
	rootMaterial = rootMaterialObj.renderer.material;
	hitSound = gameObject.GetComponent(AudioSource);

}

function Update () {
	rootMaterial.color = Color.Lerp(rootMaterial.color, Color.white, Time.deltaTime * 2.0);
}
function OnCollisionEnter(collision : Collision) {
	var tag = collision.gameObject.tag;
	if (tag != "Ignore") {
			
	
		health--;
		hitSound.Play();
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