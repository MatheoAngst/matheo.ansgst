import React, { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, ScrollControls, useScroll, Text } from '@react-three/drei'
import * as THREE from 'three'

const TOTAL_DEPTH = 320 
const POINTS_COUNT = 1500
const FONT_TEKTUR = import.meta.env.BASE_URL + "Tektur.ttf"

const experiencesData = [
  { type: 'title', title: "MES STAGES ET PROJET VUE DE L'ESPACE", z: 0 },
  { type: 'item', title: "Garage Louis Grasser", date: "Janvier 2022", desc: "Stage informatique.", z: -25, url: "https://www.groupegrasser.fr/" },
  { type: 'subtitle', title: "MES STAGES EN BAC PRO AGORA", z: -55 },
  { type: 'item', title: "HEIBY", date: "Janvier 2023", desc: "Gestion administrative.", z: -85, url: "https://www.heiby.fr/" },
  { type: 'item', title: "BAEHREL-AGRI", date: "Février 2023", desc: "Accueil et stocks.", z: -115, url: "https://www.baehrel-agri.com/" },
  { type: 'item', title: "Collège Albert-Camus", date: "Juin 2023", desc: "Saisie de dossiers.", z: -145, url: "https://clg-camus-soufflenheim.monbureaunumerique.fr/" },
  { type: 'item', title: "Étude Da Costa", date: "Décembre 2023", desc: "Gestion administrative.", z: -175, url: "https://monexpertdudroit.com/huissier-de-justice/grand-est/soultz-sous-forets/caroline-trzmiel-da-costa/" },
  { type: 'item', title: "TMG Immobilier", date: "Mars 2024", desc: "Mise à jour site web.", z: -205, url: "https://www.tmg-immo.com/" },
  { type: 'item', title: "WOLFF Automobiles", date: "Octobre 2024", desc: "Dossiers clients.", z: -235, url: "https://www.allogarage.fr/garages/details-garage-WOLFF-AUTOMOBILES-WISSEMBOURG-2044.html" },
  { type: 'item', title: "E.Leclerc", date: "Janvier 2025", desc: "Comptabilité.", z: -265, url: "https://www.e.leclerc/mag/e-leclerc-soultz-sous-forets" },
  { type: 'item', title: "BTS SIO option SISR", date: "2026 - 2027", desc: "Formation SISR.", z: -295, url: "https://ecoleiris.fr/campus/strasbourg" }
]

const getPath = (z) => {
  const tZ = Math.abs(z)
  const x = Math.sin(tZ / 22) * 4
  const y = Math.cos(tZ / 28) * 3
  return new THREE.Vector3(x, y, -tZ)
}

function DynamicPath() {
  const scroll = useScroll()
  const pastRef = useRef()
  const futureRef = useRef()

  const { pastGeo, futureGeo } = useMemo(() => {
    const pts = []
    for (let i = 0; i <= POINTS_COUNT; i++) {
      pts.push(getPath((i / POINTS_COUNT) * TOTAL_DEPTH))
    }
    const pGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const fGeo = new THREE.BufferGeometry().setFromPoints(pts)
    return { pastGeo: pGeo, futureGeo: fGeo }
  }, [])

  useEffect(() => {
    if (futureRef.current) {
      futureRef.current.computeLineDistances()
    }
  }, [])

  useFrame(() => {
    if (!scroll || !pastRef.current || !futureRef.current) return
    const progress = Math.min(Math.max(scroll.offset, 0), 1)
    const currentIndex = Math.floor(progress * POINTS_COUNT)

    pastRef.current.geometry.setDrawRange(0, currentIndex)
    futureRef.current.geometry.setDrawRange(currentIndex, POINTS_COUNT - currentIndex)
  })

  return (
    <group>
      <line ref={pastRef} geometry={pastGeo}>
        <lineBasicMaterial color="#ffffff" />
      </line>
      <line ref={futureRef} geometry={futureGeo}>
        <lineDashedMaterial color="#ffffff" dashSize={1} gapSize={0.5} transparent opacity={0.3} />
      </line>
    </group>
  )
}

function Experiences() {
  return (
    <group>
      {experiencesData.map((item, index) => {
        const pos = getPath(item.z)
        const isTitle = item.type === 'title'
        const isSubtitle = item.type === 'subtitle'

        return (
          <group key={index} position={[pos.x, pos.y + 3.5, pos.z]}>
            <Text font={FONT_TEKTUR} color="white" fontSize={isTitle ? 1.4 : isSubtitle ? 0.9 : 0.7} textAlign="center" maxWidth={14}>
              {item.title}
            </Text>
            {item.type === 'item' && (
              <>
                <Text font={FONT_TEKTUR} color="#00ffff" fontSize={0.4} position={[0, -0.8, 0]}>{item.date}</Text>
                <Text font={FONT_TEKTUR} color="#ccc" fontSize={0.3} position={[0, -1.4, 0]} maxWidth={10} textAlign="center">{item.desc}</Text>
              </>
            )}
            {!isTitle && (
              <mesh onClick={() => item.url && window.open(item.url, '_blank')} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
                <planeGeometry args={[14, 4]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

function CameraRig() {
  const scroll = useScroll()
  useFrame((state) => {
    if (!scroll) return
    const z = scroll.offset * TOTAL_DEPTH
    const pos = getPath(z)
    state.camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 2.5, pos.z + 18), 0.1)
    state.camera.lookAt(pos.x, pos.y + 1, pos.z - 10)
  })
  return null
}

// NOUVELLE FONCTION : Surveille la fin du scroll
function RedirectAtEnd() {
  const scroll = useScroll()
  const hasRedirected = useRef(false)

  useFrame(() => {
    if (!scroll || hasRedirected.current) return
    
    // Si l'utilisateur arrive à 99.5% de la page
    if (scroll.offset > 0.995) {
      hasRedirected.current = true // Empêche de relancer la commande plusieurs fois
      window.location.href = 'index.html' // Redirige vers le CV
    }
  })
  return null
}

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      
      <a href="index.html" style={{
        position: 'absolute', top: '25px', left: '25px', zIndex: 100,
        color: 'white', textDecoration: 'none', fontFamily: 'Inter, sans-serif',
        fontSize: '13px', border: '1px solid rgba(255,255,255,0.2)',
        padding: '10px 20px', borderRadius: '30px', background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', letterSpacing: '1px'
      }}>
        RETOUR AU CV
      </a>

      <Canvas camera={{ fov: 50 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 20, 100]} />
        <ambientLight intensity={2.5} />
        <Stars radius={250} depth={200} count={12000} factor={4} fade speed={1.2} position={[0, 0, -150]} />
        
        <Suspense fallback={null}>
          <ScrollControls pages={12} damping={0.25}>
            <CameraRig />
            <DynamicPath />
            <Experiences />
            {/* INCLUSION DU COMPOSANT DE REDIRECTION ICI */}
            <RedirectAtEnd />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  )
}