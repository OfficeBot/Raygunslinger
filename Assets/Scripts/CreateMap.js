#pragma strict
/*
	VISUAL DEBUG ELEMENTS
*/
var showEdges  = false;


var visualObject : GameObject;
var magnitude : float = 1.0;
// Width and height of the texture in pixels.
private var mapWidth: int;
private var mapHeight: int;

// The origin of the sampled area in the plane.
//Modify these to create a more random map.
var xOrg: float;
var yOrg: float;

// The number of cycles of the basic noise pattern that are repeated
// over the width and height of the texture.
var scale = 1.0;

//This might be a little odd in its naming, but this multidimensional
//array will hold the raw height values of the perlin noise function,
//hence the name.
private var mapHeights : float[,];

/*
	These are "magic numbers" that are for testing only. They should be
	removed, killed, and the bodies burned when testing is complete.
	Seriously.
	That means gradientValue and gradientThisRow are just for testing.
*/
var gradientValue : float;
private var heightLookups = [1, 1, 1, 1, 3, 3, 4, 4, 5, 6];
// private var cliffs = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
var materials : Material[] = new Material[10];
var cliffMaterial : Material;
/*
	This variables are here just to help visualize the map. Once we
	have proper textures, these should be removed/updated.
	We will be using the same dynamic texture method that is shown in
	the perlin noise tutorial on Unity's scripting guide.
*/


function Start () {
	//Initialize our multidimensional array. It's important to know that
	//since this is not a dynamic array, you cannot resize the map after
	//it's been initialized!!
	/*
		@todo
		Eventually, this should contain several map sizes that we can
		pull from when initializing our level. For example:

		var largeMap  = float[1000,1000];
		var mediumMap = float[500,500];
		var smallMap  = float[100,100];

		mapHeights = largeMap;

		We would then use a nested if then or switch statement

	*/

	mapHeights = new float[200,200];
	mapWidth = 200;
	mapHeight = 200;
	gradientValue = 2.0 / mapHeight; //or mapwidth, if that's our direction;

	CalcNoise();
}


function CalcNoise() {
	// For each pixel in the texture...
	for (var y = 0.0; y < mapHeight; y++) {
		// var gradientThisRow : float = 0.1;
		for (var x = 0.0; x < mapWidth; x++) {
			// Get a sample from the corresponding position in the noise plane
			// and create a greyscale pixel from it.
			var xCoord = xOrg + x / mapWidth * scale;
			var yCoord = yOrg + y / mapHeight * scale;
			var sample = Mathf.PerlinNoise(xCoord, yCoord);
			sample += (gradientValue * x) - 1;
			sample = Mathf.Clamp(sample, 0.0, 1.0);
			sample = Mathf.Floor( sample * 9.0 );
			var yValue = heightLookups[sample];
			//Do we need a cliff? Check the tile that's further down.
			//Make sure this isn't our bottom row, since that would give us an 
			//out-of-bounds error.
			var offset = 0;
			var tile : GameObject;

			if (x > 0 && mapHeights[x-1,y] < yValue) {
				//THIS IS A CLIFF
				offset = yValue - mapHeights[x-1,y];
				// Debug.Log(offset);
				// if (showEdges) {
				// tile = Instantiate(visualObject, Vector3(x+offset, 1 , y), Quaternion.identity);
				// tile.renderer.material = cliffMaterial;
				// }
			} else {
				tile = Instantiate(visualObject, Vector3(x+offset, 0 , y), Quaternion.identity);
				tile.renderer.material = materials[sample];

			}
			if (x+offset < mapHeight) {
				mapHeights[x+offset,y] = yValue;
			}
		};
	}
}

function Update () {
	//Nothing to do here.
}
