import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
  const isMobile = window.innerWidth < 768
  const isLandscape = window.innerHeight < window.innerWidth

  return (
    <group>
      {experiencesData.map((item, index) => {
        const pos = getPath(item.z)
        const isTitle = item.type === 'title'
        const isSubtitle = item.type === 'subtitle'

        // Adapter les tailles pour landscape
        const getTitleSize = () => {
          if (!isMobile) return 1.4
          return isLandscape ? 0.5 : 0.8
        }

        const getSubtitleSize = () => {
          if (!isMobile) return 0.9
          return isLandscape ? 0.35 : 0.6
        }

        const getItemSize = () => {
          if (!isMobile) return 0.7
          return isLandscape ? 0.25 : 0.4
        }

        const getDateSize = () => {
          return isLandscape ? 0.15 : (isMobile ? 0.24 : 0.4)
        }

        const getDescSize = () => {
          return isLandscape ? 0.12 : (isMobile ? 0.18 : 0.3)
        }

        const getMaxWidth = () => {
          if (!isMobile) return 14
          return isLandscape ? 6 : 8
        }

        return (
          <group key={index} position={[pos.x, pos.y + (isLandscape ? 2 : 3.5), pos.z]}>
            <Text font={FONT_TEKTUR} color="white" fontSize={isTitle ? getTitleSize() : isSubtitle ? getSubtitleSize() : getItemSize()} textAlign="center" maxWidth={getMaxWidth()}>
              {item.title}
            </Text>
            {item.type === 'item' && (
              <>
                <Text font={FONT_TEKTUR} color="#00ffff" fontSize={getDateSize()} position={[0, -0.6, 0]}>{item.date}</Text>
                <Text font={FONT_TEKTUR} color="#ccc" fontSize={getDescSize()} position={[0, -1, 0]} maxWidth={getMaxWidth()} textAlign="center">{item.desc}</Text>
              </>
            )}
            {!isTitle && (
              <mesh onClick={() => item.url && window.open(item.url, '_blank')} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
                <planeGeometry args={[getMaxWidth(), 3]} />
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
  const isLandscape = window.innerHeight < window.innerWidth

  useFrame((state) => {
    if (!scroll) return
    const z = scroll.offset * TOTAL_DEPTH
    const pos = getPath(z)
    // En paysage, réduire l'offset Z pour un meilleur angle
    const zOffset = isLandscape ? 12 : 18
    state.camera.position.lerp(new THREE.Vector3(pos.x, pos.y + 2.5, pos.z + zOffset), 0.1)
    state.camera.lookAt(pos.x, pos.y + 1, pos.z - 10)
  })
  return null
}

function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth)

  useEffect(() => {
    const handleScroll = () => {
      // Cacher l'indicateur dès que l'utilisateur scrolle
      if (window.scrollY > 10) {
        setIsVisible(false)
      }
    }

    const handleOrientationChange = () => {
      setIsLandscape(window.innerHeight < window.innerWidth)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [isVisible])

  // Masquer en mode paysage (évite de perdre de l'espace d'affichage)
  if (!isVisible || isLandscape) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      pointerEvents: 'none',
      textAlign: 'center',
      animation: 'float 2s ease-in-out infinite'
    }}>
      <style>{`
        @keyframes float {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
      <div style={{
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
        letterSpacing: '1px',
        marginBottom: '12px',
        fontFamily: 'Inter, sans-serif',
        textTransform: 'uppercase'
      }}>
        Faites défiler pour explorer
      </div>
      <div style={{
        fontSize: '24px',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        ↓
      </div>
    </div>
  )
}

function RedirectAtEnd() {
  const scroll = useScroll()
  const hasRedirected = useRef(false)

  useFrame(() => {
    if (!scroll || hasRedirected.current) return

    // Si l'utilisateur arrive tout à la fin du scroll
    if (scroll.offset > 0.99) {
      hasRedirected.current = true
      // Animation de fondu au noir
      document.body.style.opacity = 0
      document.body.style.transition = "opacity 0.8s ease"
      // Redirection après l'animation
      setTimeout(() => {
        window.location.href = 'index.html'
      }, 800)
    }
  })
  return null
}

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#050505' }}>

      <ScrollIndicator />

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
        <Stars radius={250} depth={200} count={12000} factor={7} fade speed={1.2} position={[0, 0, -150]} />

        <Suspense fallback={null}>
          <ScrollControls pages={12} damping={0.25}>
            <CameraRig />
            <DynamicPath />
            <Experiences />
            <RedirectAtEnd />
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  )
}
