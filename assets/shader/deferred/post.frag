precision highp float;

#define DISPLAY_BLOOM 5
#define DISPLAY_BLOOM2 6
#define DISPLAY_TOON 7
#define DISPLAY_AMBIENT 8

uniform sampler2D u_shadeTex;
uniform sampler2D u_normalTex;
uniform sampler2D u_positionTex;

varying vec2 v_texcoord;

uniform int u_displayType;

uniform int u_width;
uniform int u_height;

uniform vec3 u_lightCol;
uniform vec3 u_lightPos;
uniform vec3 u_eyePos;

float linearizeDepth( float exp_depth, float near, float far ){
	return ( 2.0 * near ) / ( far + near - exp_depth * ( far - near ) );
}

void main()
{
  // Currently acts as a pass filter that immmediately renders the shaded texture
  // Fill in post-processing as necessary HERE
  // NOTE : You may choose to use a key-controlled switch system to display one feature at a time
  
	if (u_displayType == DISPLAY_TOON)
	{
		vec3 color = texture2D( u_shadeTex, v_texcoord).rgb;
		
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		vec3 lightDir = normalize(texture2D(u_positionTex, v_texcoord).rgb - u_lightPos);
		float intensity = dot(-lightDir, normal);
	 
		// Discretize color
		if (intensity > 0.95)
			color = vec3(1.0,1,1) * color;
		else if (intensity > 0.5)
			color = vec3(0.7,0.7,0.7) * color;
		else if (intensity > 0.05)
			color = vec3(0.35,0.35,0.35) * color;
		else
			color = vec3(0.1,0.1,0.1) * color;
		
		//silhouetting, sobel detect
		vec2 G = vec2(0,0);
		for (int i = -1; i <= 1; i++)
		{
			for (int j = -1; j <= 1; j++)
			{
				vec3 n = normalize(texture2D(u_normalTex, v_texcoord + vec2( float(i)/float(u_width), float(j)/float(u_height))).rgb);
				float cosT = dot(n, normal);
				G.x += float((i == 0) ? j + j : j + 0) * cosT;
				G.y += float((j == 0) ? i + i : i + 0) * cosT;
			}
		}
		float line = (1.0 - 0.3 * length(G));
		
		gl_FragColor = vec4(line * color, 1.0); 
		
	}
	else if( u_displayType == DISPLAY_BLOOM )
	{
		vec3 normal = normalize(texture2D(u_normalTex, v_texcoord).rgb);
		vec3 color = vec3(0,0,0);
		int count = 0;
		for (int i = -10; i< 10; i++)
		{
			for (int j = -10; j < 10; j++)	
			{
				
				float dx = float(i) / float(u_width);
				float dy = float(j) / float(u_height);
				vec3 n = texture2D(u_normalTex, v_texcoord + vec2(dx, dy)).rgb;
				if (n.z > 0.2)
				{
					color += texture2D( u_shadeTex, v_texcoord + vec2(dx, dy)).rgb;
					count++;
				}
			}
		}
		color = (count > 0) ? color / float(count) : color;
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb + 0.5*color, 1.0); 
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); 
	}
	else if (u_displayType == DISPLAY_BLOOM2)
	{
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); 
	}
	else if (u_displayType == DISPLAY_AMBIENT)
	{
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); 
	}
	else
		gl_FragColor = vec4(texture2D( u_shadeTex, v_texcoord).rgb, 1.0); 
}