const updateSpriteWGSL = `
struct Particle {
  pos : vec2<f32>
};

struct Particles {
  particles : array<Particle>
};

@binding(0) @group(0) var<storage, read_write> particlesA : Particles;
@binding(1) @group(0) var<storage, read_write> particlesB : Particles;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>)
 {
  var index : u32 = GlobalInvocationID.x;
  const NUMPARTICLES : u32 = 131072;
  var vPos = particlesA.particles[index].pos;
  var minDistance = 100000.0; //infinity -_- 
  var nearestNeighborIndex : i32 = -1; 
 // var nearestNeighborIndex : u32 = -1; <- Mismatch! remove

  var i : u32 = 0u;
  for (; i < NUMPARTICLES; i++)
  {
    if (i != index) { 
      let otherPos = particlesA.particles[i].pos;
      let d = distance(vPos, otherPos);
      if (d < 0.003)
      { 
        continue;
      }

      if (d < minDistance)
      {
        minDistance = d;
        nearestNeighborIndex = i32(i); 
      }
    }
  }

  if (nearestNeighborIndex != -1)
  {
    let nearestNeighborPos = particlesA.particles[nearestNeighborIndex].pos;
    let dx = nearestNeighborPos.x - vPos.x;
    let dy = nearestNeighborPos.y - vPos.y;
    let magnitude = sqrt(dx * dx + dy * dy);
    let stepSize = 0.001;
    vPos.x += stepSize * (dx / magnitude);
    vPos.y += stepSize * (dy / magnitude);
  } 

  particlesB.particles[index].pos = vPos;
}
`;

export default updateSpriteWGSL;
