#pragma strict

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
private var heightLookups = [-1, 1, 1, 1, 2, 2, 3, 3, 4, 10];

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

	mapHeights = new float[100,100];
	mapWidth = 100;
	mapHeight = 100;
	gradientValue = 1.0 / mapHeight; //or mapwidth, if that's our direction;

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
			mapHeights[xCoord,yCoord] = sample;
			// var yCoordNormal :int = Mathf.Floor(sample * 10 * gradientThisRow);
			// var yCoordNormal : int = Mathf.Floor(sample * 10) + (gradientValue * x);
			// Debug.Log(yCoordNormal);
			var yCoordNormal : int = Mathf.Lerp(Mathf.Floor(sample*10) * (gradientValue*x), 10, gradientValue * x);

			// var yCoordNormal : int = Mathf.Lerp( Mathf.Round((gradientValue * x ) +sample), Mathf.Round(gradientValue * x  * sample), );
			// yCoordNormal += Mathf.Floor(gradientValue * x * 10);
			// yCoordNormal = Mathf.Clamp(yCoordNormal, 0,9);
			var ySet = heightLookups[yCoordNormal];
			if (yCoordNormal != 0) {
				Instantiate(visualObject, Vector3(x, ySet , y), Quaternion.identity);
			}
			// gradientThisRow += gradientValue;
		};
	}
}

function Update () {
	//Nothing to do here.
}
