'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PresentationControls, Stage, Lightformer } from '@react-three/drei'
import { AvatarCustomization } from '../types'
import * as THREE from 'three'
import { Suspense } from 'react'

interface AvatarPreview3DProps {
  avatar: AvatarCustomization
}

function AvatarModel({ avatar }: { avatar: AvatarCustomization }) {
  const skinColor = avatar.body?.skinColor || '#FDBCB4'
  const hairColor = avatar.hair?.color || '#000000'
  const hairHighlights = avatar.hair?.highlights
  const eyeColor = avatar.face?.eyes?.color || '#000000'
  const facialHairColor = avatar.hair?.color || '#000000'
  
  // Body scale based on type
  const getBodyScale = (type: string) => {
    switch(type) {
      case 'slim': return [0.8, 1, 0.8]
      case 'athletic': return [1.1, 1.1, 1.1] 
      case 'average': return [1, 1, 1]
      case 'curvy': return [1.2, 1, 1.3]
      case 'muscular': return [1.3, 1.1, 1.2]
      default: return [1, 1, 1]
    }
  }
  const bodyScale = getBodyScale(avatar.body?.type || 'average')
  
  // Height adjustment
  const height = avatar.body?.height || 1.0
  
  return (
    <group scale={[1, height, 1]}>
      {/* Body - More detailed */}
      <group position={[0, -0.5 * height, 0]} scale={bodyScale}>
        {/* Torso */}
        <mesh>
          <capsuleGeometry args={[0.4, 0.6, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
      </group>
      
      {/* Neck */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      
      {/* Head - More detailed based on face shape */}
      <mesh position={[0, 0.8, 0]}>
        {avatar.face?.shape === 'round' && <sphereGeometry args={[0.35, 32, 32]} />}
        {avatar.face?.shape === 'oval' && <sphereGeometry args={[0.33, 32, 32]} />}
        {avatar.face?.shape === 'square' && <boxGeometry args={[0.6, 0.7, 0.6]} />}
        {avatar.face?.shape === 'heart' && <sphereGeometry args={[0.35, 32, 32]} />}
        {(avatar.face?.shape === 'diamond' || !avatar.face?.shape) && <sphereGeometry args={[0.35, 32, 32]} />}
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      
      {/* Hair - Different styles */}
      {avatar.hair?.style && avatar.hair.style !== 'bald' && (
        <group position={[0, 1.1, 0]}>
          {/* Base hair */}
          <mesh>
            {/* 짧은 머리 */}
            {avatar.hair.style === 'short' && <sphereGeometry args={[0.38, 16, 16]} />}
            {avatar.hair.style === 'pixie' && <sphereGeometry args={[0.35, 16, 16]} />}
            {avatar.hair.style === 'bob' && <sphereGeometry args={[0.4, 16, 16]} />}
            {avatar.hair.style === 'mohawk' && <boxGeometry args={[0.1, 0.4, 0.6]} />}
            {avatar.hair.style === 'spiky' && <sphereGeometry args={[0.36, 16, 16]} />}
            
            {/* 중간 길이 */}
            {avatar.hair.style === 'medium' && <sphereGeometry args={[0.42, 16, 16]} />}
            {avatar.hair.style === 'wavy' && <sphereGeometry args={[0.44, 16, 16]} />}
            {avatar.hair.style === 'curly' && <sphereGeometry args={[0.46, 16, 16]} />}
            {avatar.hair.style === 'bun' && <sphereGeometry args={[0.38, 16, 16]} />}
            
            {/* 긴 머리 */}
            {(avatar.hair.style === 'long' || avatar.hair.style === 'long-wavy' || avatar.hair.style === 'long-curly') && (
              <sphereGeometry args={[0.45, 16, 16]} />
            )}
            {(avatar.hair.style === 'ponytail' || avatar.hair.style === 'high-ponytail' || avatar.hair.style === 'side-ponytail') && (
              <sphereGeometry args={[0.38, 16, 16]} />
            )}
            {avatar.hair.style === 'pigtails' && <sphereGeometry args={[0.38, 16, 16]} />}
            {(avatar.hair.style === 'braids' || avatar.hair.style === 'french-braid' || avatar.hair.style === 'fishtail-braid') && (
              <sphereGeometry args={[0.4, 16, 16]} />
            )}
            {avatar.hair.style === 'twin-buns' && <sphereGeometry args={[0.38, 16, 16]} />}
            {avatar.hair.style === 'half-up' && <sphereGeometry args={[0.43, 16, 16]} />}
            {(avatar.hair.style === 'loose-curls' || avatar.hair.style === 'beach-waves') && (
              <sphereGeometry args={[0.48, 16, 16]} />
            )}
            
            {/* 특별한 스타일 */}
            {avatar.hair.style === 'afro' && <sphereGeometry args={[0.5, 16, 16]} />}
            {avatar.hair.style === 'dreadlocks' && <sphereGeometry args={[0.46, 16, 16]} />}
            {avatar.hair.style === 'space-buns' && <sphereGeometry args={[0.38, 16, 16]} />}
            
            {/* 기본 설정 */}
            {!['short', 'pixie', 'bob', 'mohawk', 'spiky', 'medium', 'wavy', 'curly', 'bun', 'long', 'long-wavy', 'long-curly', 'ponytail', 'high-ponytail', 'side-ponytail', 'pigtails', 'braids', 'french-braid', 'fishtail-braid', 'twin-buns', 'half-up', 'loose-curls', 'beach-waves', 'afro', 'dreadlocks', 'space-buns'].includes(avatar.hair.style) && (
              <sphereGeometry args={[0.4, 16, 16]} />
            )}
            
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          
          {/* 긴 머리 추가 부분 */}
          {(avatar.hair.style === 'long' || avatar.hair.style === 'long-wavy' || avatar.hair.style === 'long-curly' || 
            avatar.hair.style === 'loose-curls' || avatar.hair.style === 'beach-waves') && (
            <group>
              {/* 뒷머리 긴 부분 */}
              <mesh position={[0, -0.3, -0.2]}>
                <cylinderGeometry args={[0.3, 0.25, 0.8, 16]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
              {/* 어깨까지 내려오는 부분 */}
              <mesh position={[-0.25, -0.6, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
              <mesh position={[0.25, -0.6, 0]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
            </group>
          )}
          
          {/* Hair highlights */}
          {hairHighlights && (
            <mesh scale={[1.02, 1.02, 1.02]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial 
                color={hairHighlights} 
                transparent 
                opacity={0.3} 
                roughness={0.7} 
              />
            </mesh>
          )}
          
          {/* Ponytail 구현 */}
          {(avatar.hair.style === 'ponytail' || avatar.hair.style === 'high-ponytail') && (
            <mesh position={[0, avatar.hair.style === 'high-ponytail' ? 0 : -0.2, -0.4]} rotation={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          )}
          
          {/* Side ponytail */}
          {avatar.hair.style === 'side-ponytail' && (
            <mesh position={[0.3, -0.1, -0.3]} rotation={[0.3, 0.5, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          )}
          
          {/* Pigtails */}
          {avatar.hair.style === 'pigtails' && (
            <group>
              <mesh position={[-0.25, -0.1, -0.3]} rotation={[0.3, -0.3, 0]}>
                <cylinderGeometry args={[0.06, 0.1, 0.4, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
              <mesh position={[0.25, -0.1, -0.3]} rotation={[0.3, 0.3, 0]}>
                <cylinderGeometry args={[0.06, 0.1, 0.4, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
            </group>
          )}
          
          {/* Twin buns */}
          {avatar.hair.style === 'twin-buns' && (
            <group>
              <mesh position={[-0.2, 0.1, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
              <mesh position={[0.2, 0.1, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
            </group>
          )}
          
          {/* Space buns */}
          {avatar.hair.style === 'space-buns' && (
            <group>
              <mesh position={[-0.25, 0.15, 0]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
              <mesh position={[0.25, 0.15, 0]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
            </group>
          )}
        </group>
      )}
      
      {/* Face Features */}
      <group position={[0, 0.8, 0.3]}>
        {/* Eyes */}
        <group>
          {/* Eye whites */}
          <mesh position={[-0.1, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          
          {/* Iris */}
          <mesh position={[-0.1, 0, 0.02]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          <mesh position={[0.1, 0, 0.02]}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={eyeColor} />
          </mesh>
          
          {/* Pupils */}
          <mesh position={[-0.1, 0, 0.025]}>
            <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <mesh position={[0.1, 0, 0.025]}>
            <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
        
        {/* Eyebrows */}
        <group position={[0, 0.12, 0]}>
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.08, 0.01, 0.02]} />
            <meshStandardMaterial color={avatar.face?.eyebrows?.color || hairColor} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.08, 0.01, 0.02]} />
            <meshStandardMaterial color={avatar.face?.eyebrows?.color || hairColor} />
          </mesh>
        </group>
        
        {/* Nose */}
        <mesh position={[0, -0.1, 0.05]}>
          <coneGeometry args={[0.03, 0.08, 4]} rotation={[Math.PI, 0, 0]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.2, 0.02]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color={avatar.face?.mouth?.lipColor || '#E4967A'} />
        </mesh>
      </group>
      
      {/* Facial Hair */}
      {avatar.face?.facialHair && (
        <group position={[0, 0.6, 0.35]}>
          {(avatar.face.facialHair === 'mustache' || avatar.face.facialHair === 'full') && (
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.02, 0.05]} />
              <meshStandardMaterial color={facialHairColor} roughness={0.95} />
            </mesh>
          )}
          {(avatar.face.facialHair === 'goatee' || avatar.face.facialHair === 'full') && (
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.08, 0.1, 0.05]} />
              <meshStandardMaterial color={facialHairColor} roughness={0.95} />
            </mesh>
          )}
        </group>
      )}
      
      {/* Clothing - Top */}
      {avatar.clothing?.top && avatar.clothing.top.id && (
        <group position={[0, -0.3, 0]}>
          {/* 드레스 스타일 */}
          {avatar.clothing.top.type === 'dress' && (
            <group>
              {/* 드레스 상체 */}
              <mesh>
                <cylinderGeometry args={[0.45, 0.4, 0.6, 16]} />
                <meshStandardMaterial 
                  color={avatar.clothing.top.color || "#FFB6C1"} 
                  roughness={0.6}
                />
              </mesh>
              {/* 드레스 스커트 부분 */}
              <mesh position={[0, -0.5, 0]}>
                {avatar.clothing.top.style === 'maxi' ? (
                  <cylinderGeometry args={[0.6, 0.45, 0.8, 16]} />
                ) : avatar.clothing.top.style === 'midi' ? (
                  <cylinderGeometry args={[0.55, 0.45, 0.6, 16]} />
                ) : (
                  <cylinderGeometry args={[0.5, 0.45, 0.4, 16]} />
                )}
                <meshStandardMaterial 
                  color={avatar.clothing.top.color || "#FFB6C1"} 
                  roughness={0.6}
                />
              </mesh>
              {/* 드레스 비치 장식 */}
              {(avatar.clothing.top.style === 'cocktail' || avatar.clothing.top.style === 'party') && (
                <mesh position={[0, 0.1, 0]}>
                  <torusGeometry args={[0.2, 0.02, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
                  <meshStandardMaterial 
                    color="#FFD700" 
                    metalness={0.8} 
                    roughness={0.2} 
                  />
                </mesh>
              )}
            </group>
          )}
          
          {/* 일반 상의 */}
          {avatar.clothing.top.type !== 'dress' && (
            <mesh>
              {/* 크롭탑 스타일 */}
              {(avatar.clothing.top.name.includes('크롭') || avatar.clothing.top.style === 'crop') ? (
                <cylinderGeometry args={[0.42, 0.38, 0.4, 16]} />
              ) : avatar.clothing.top.type === 'blouse' ? (
                <cylinderGeometry args={[0.48, 0.42, 0.65, 16]} />
              ) : (
                <cylinderGeometry args={[0.45, 0.4, 0.6, 16]} />
              )}
              <meshStandardMaterial 
                color={avatar.clothing.top.color || "#3B82F6"} 
                roughness={avatar.clothing.top.type === 'blouse' ? 0.3 : 0.7}
                metalness={avatar.clothing.top.type === 'leather-jacket' ? 0.4 : 0}
              />
            </mesh>
          )}
          
          {/* Collar */}
          {avatar.clothing.top.style === 'formal' && (
            <mesh position={[0, 0.3, 0]}>
              <torusGeometry args={[0.18, 0.03, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color={avatar.clothing.top.color || "#3B82F6"} />
            </mesh>
          )}
          
          {/* 블라우스 러플 */}
          {avatar.clothing.top.name.includes('러플') && (
            <group>
              <mesh position={[0, 0.25, 0.1]}>
                <boxGeometry args={[0.3, 0.05, 0.02]} />
                <meshStandardMaterial color={avatar.clothing.top.color || "#FFB6C1"} />
              </mesh>
              <mesh position={[0, 0.15, 0.1]}>
                <boxGeometry args={[0.25, 0.03, 0.015]} />
                <meshStandardMaterial color={avatar.clothing.top.color || "#FFB6C1"} />
              </mesh>
            </group>
          )}
        </group>
      )}
      
      {/* Clothing - Bottom */}
      {avatar.clothing?.bottom && avatar.clothing.bottom.id && (
        <group position={[0, -0.8, 0]}>
          {/* 스커트 */}
          {avatar.clothing.bottom.type === 'skirt' && (
            <mesh>
              {avatar.clothing.bottom.style === 'mini' || avatar.clothing.bottom.name.includes('미니') ? (
                <cylinderGeometry args={[0.5, 0.4, 0.3, 16]} />
              ) : avatar.clothing.bottom.style === 'midi' || avatar.clothing.bottom.name.includes('미디') ? (
                <cylinderGeometry args={[0.55, 0.4, 0.6, 16]} />
              ) : avatar.clothing.bottom.style === 'maxi' || avatar.clothing.bottom.name.includes('맥시') ? (
                <cylinderGeometry args={[0.6, 0.4, 1.0, 16]} />
              ) : avatar.clothing.bottom.name.includes('플리츠') ? (
                <cylinderGeometry args={[0.48, 0.38, 0.4, 16]} />
              ) : avatar.clothing.bottom.name.includes('튤') ? (
                <sphereGeometry args={[0.45, 16, 16]} />
              ) : (
                <cylinderGeometry args={[0.45, 0.38, 0.4, 16]} />
              )}
              <meshStandardMaterial 
                color={avatar.clothing.bottom.color || "#FFB6C1"} 
                roughness={avatar.clothing.bottom.name.includes('튤') ? 0.3 : 0.7}
                transparent={avatar.clothing.bottom.name.includes('튤')}
                opacity={avatar.clothing.bottom.name.includes('튤') ? 0.8 : 1}
              />
            </mesh>
          )}
          
          {/* 바지 */}
          {avatar.clothing.bottom.type === 'pants' && (
            <group>
              {/* 좌다리 */}
              <mesh position={[-0.15, -0.3, 0]}>
                {avatar.clothing.bottom.name.includes('스키니') ? (
                  <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
                ) : avatar.clothing.bottom.name.includes('레깅스') ? (
                  <cylinderGeometry args={[0.07, 0.09, 0.8, 8]} />
                ) : (
                  <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
                )}
                <meshStandardMaterial color={avatar.clothing.bottom.color || "#2563EB"} roughness={0.7} />
              </mesh>
              {/* 오른다리 */}
              <mesh position={[0.15, -0.3, 0]}>
                {avatar.clothing.bottom.name.includes('스키니') ? (
                  <cylinderGeometry args={[0.08, 0.1, 0.8, 8]} />
                ) : avatar.clothing.bottom.name.includes('레깅스') ? (
                  <cylinderGeometry args={[0.07, 0.09, 0.8, 8]} />
                ) : (
                  <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
                )}
                <meshStandardMaterial color={avatar.clothing.bottom.color || "#2563EB"} roughness={0.7} />
              </mesh>
              {/* 허리 */}
              <mesh>
                <cylinderGeometry args={[0.4, 0.35, 0.3, 16]} />
                <meshStandardMaterial color={avatar.clothing.bottom.color || "#2563EB"} roughness={0.7} />
              </mesh>
            </group>
          )}
          
          {/* 반바지 */}
          {avatar.clothing.bottom.type === 'shorts' && (
            <group>
              {/* 좌다리 */}
              <mesh position={[-0.15, -0.1, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 0.25, 8]} />
                <meshStandardMaterial color={avatar.clothing.bottom.color || "#2563EB"} roughness={0.7} />
              </mesh>
              {/* 오른다리 */}
              <mesh position={[0.15, -0.1, 0]}>
                <cylinderGeometry args={[0.12, 0.15, 0.25, 8]} />
                <meshStandardMaterial color={avatar.clothing.bottom.color || "#2563EB"} roughness={0.7} />
              </mesh>
              {/* 허리 */}
              <mesh>
                <cylinderGeometry args={[0.4, 0.35, 0.25, 16]} />
                <meshStandardMaterial color={avatar.clothing.bottom.color || "#2563EB"} roughness={0.7} />
              </mesh>
            </group>
          )}
        </group>
      )}
      
      {/* Clothing - Shoes */}
      {avatar.clothing?.shoes && avatar.clothing.shoes.id && (
        <group position={[0, -1.2, 0]}>
          {/* Left Shoe */}
          <mesh position={[-0.15, avatar.clothing.shoes.type === 'heels' ? 0.05 : 0, 0.1]}>
            {avatar.clothing.shoes.type === 'heels' ? (
              <group>
                {/* 굽 부분 */}
                <mesh>
                  <boxGeometry args={[0.22, 0.08, 0.35]} />
                  <meshStandardMaterial 
                    color={avatar.clothing.shoes.color || "#E53E3E"} 
                    roughness={0.4}
                    metalness={0.2}
                  />
                </mesh>
                {/* 힐 */}
                <mesh position={[0, -0.1, -0.1]}>
                  <cylinderGeometry args={[0.02, 0.03, 0.15, 8]} />
                  <meshStandardMaterial 
                    color={avatar.clothing.shoes.color || "#E53E3E"} 
                    roughness={0.4}
                  />
                </mesh>
              </group>
            ) : avatar.clothing.shoes.type === 'boots' ? (
              <boxGeometry args={[0.25, 0.25, 0.4]} />
            ) : avatar.clothing.shoes.type === 'sandals' ? (
              <boxGeometry args={[0.23, 0.05, 0.35]} />
            ) : (
              <boxGeometry args={[0.25, 0.1, 0.4]} />
            )}
            {avatar.clothing.shoes.type !== 'heels' && (
              <meshStandardMaterial 
                color={avatar.clothing.shoes.color || "#1F2937"} 
                roughness={avatar.clothing.shoes.type === 'sandals' ? 0.6 : 0.8}
                metalness={avatar.clothing.shoes.name.includes('컴배') ? 0.3 : 0}
              />
            )}
          </mesh>
          
          {/* Right Shoe */}
          <mesh position={[0.15, avatar.clothing.shoes.type === 'heels' ? 0.05 : 0, 0.1]}>
            {avatar.clothing.shoes.type === 'heels' ? (
              <group>
                {/* 굽 부분 */}
                <mesh>
                  <boxGeometry args={[0.22, 0.08, 0.35]} />
                  <meshStandardMaterial 
                    color={avatar.clothing.shoes.color || "#E53E3E"} 
                    roughness={0.4}
                    metalness={0.2}
                  />
                </mesh>
                {/* 힐 */}
                <mesh position={[0, -0.1, -0.1]}>
                  <cylinderGeometry args={[0.02, 0.03, 0.15, 8]} />
                  <meshStandardMaterial 
                    color={avatar.clothing.shoes.color || "#E53E3E"} 
                    roughness={0.4}
                  />
                </mesh>
              </group>
            ) : avatar.clothing.shoes.type === 'boots' ? (
              <boxGeometry args={[0.25, 0.25, 0.4]} />
            ) : avatar.clothing.shoes.type === 'sandals' ? (
              <boxGeometry args={[0.23, 0.05, 0.35]} />
            ) : (
              <boxGeometry args={[0.25, 0.1, 0.4]} />
            )}
            {avatar.clothing.shoes.type !== 'heels' && (
              <meshStandardMaterial 
                color={avatar.clothing.shoes.color || "#1F2937"} 
                roughness={avatar.clothing.shoes.type === 'sandals' ? 0.6 : 0.8}
                metalness={avatar.clothing.shoes.name.includes('컴배') ? 0.3 : 0}
              />
            )}
          </mesh>
          
          {/* 부츠 추가 높이 */}
          {avatar.clothing.shoes.name.includes('니하이') && (
            <group>
              <mesh position={[-0.15, 0.2, 0]}>
                <cylinderGeometry args={[0.12, 0.14, 0.4, 8]} />
                <meshStandardMaterial color={avatar.clothing.shoes.color || "#1F2937"} roughness={0.8} />
              </mesh>
              <mesh position={[0.15, 0.2, 0]}>
                <cylinderGeometry args={[0.12, 0.14, 0.4, 8]} />
                <meshStandardMaterial color={avatar.clothing.shoes.color || "#1F2937"} roughness={0.8} />
              </mesh>
            </group>
          )}
        </group>
      )}
      
      {/* Accessories */}
      {avatar.accessories?.head && (
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.15, 16]} />
          <meshStandardMaterial 
            color={avatar.accessories.head.color || "#4B5563"} 
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      )}
      
      {avatar.accessories?.face && avatar.accessories.face.type === 'glasses' && (
        <group position={[0, 0.85, 0.38]}>
          {/* Glasses frame */}
          <mesh position={[-0.1, 0, 0]}>
            <torusGeometry args={[0.06, 0.005, 8, 16]} />
            <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <torusGeometry args={[0.06, 0.005, 8, 16]} />
            <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Bridge */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.005, 0.005]} />
            <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}
      
      {/* Special Effects */}
      {avatar.effects && avatar.effects.map((effect, index) => (
        <group key={effect.id}>
          {effect.glow && (
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshStandardMaterial 
                color={effect.color || "#FFD700"}
                transparent
                opacity={0.2}
                emissive={effect.color || "#FFD700"}
                emissiveIntensity={0.3}
              />
            </mesh>
          )}
          
          {effect.particle && (
            <group position={[0, 1, 0]}>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2
                const radius = 0.8
                const x = Math.cos(angle) * radius
                const z = Math.sin(angle) * radius
                return (
                  <mesh key={i} position={[x, Math.sin(Date.now() * 0.001 + i) * 0.1, z]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial 
                      color={effect.color || "#00FFFF"}
                      emissive={effect.color || "#00FFFF"}
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                )
              })}
            </group>
          )}
          
          {effect.trail && (
            <mesh position={[0, 0.8, -0.5]}>
              <coneGeometry args={[0.3, 1.5, 8]} rotation={[Math.PI, 0, 0]} />
              <meshStandardMaterial 
                color={effect.color || "#00FF00"}
                transparent
                opacity={0.6}
                emissive={effect.color || "#00FF00"}
                emissiveIntensity={0.2}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

export function AvatarPreview3D({ avatar }: AvatarPreview3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 1, 2.5], fov: 45 }}
        gl={{ preserveDrawingBuffer: true }}
        shadows
      >
        <Suspense fallback={null}>
          <Stage 
            environment="city" 
            intensity={0.6} 
            contactShadow={false}
            shadowBias={-0.001}
          >
            <AvatarModel avatar={avatar} />
          </Stage>
          <Environment preset="city">
            <Lightformer 
              form="rect" 
              intensity={2} 
              position={[0, 5, -10]} 
              scale={[10, 10, 1]} 
            />
            <Lightformer 
              form="rect" 
              intensity={1} 
              position={[-5, 1, -5]} 
              scale={[10, 10, 1]} 
              color="#f0f0f0"
            />
            <Lightformer 
              form="rect" 
              intensity={1} 
              position={[5, 1, -5]} 
              scale={[10, 10, 1]} 
              color="#f0f0f0"
            />
          </Environment>
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minDistance={2}
          maxDistance={4}
          target={[0, 0.8, 0]}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={avatar.effects && avatar.effects.length > 0}
          autoRotateSpeed={avatar.effects && avatar.effects.length > 0 ? 3 : 2}
        />
      </Canvas>
    </div>
  )
}