# Avatar-World Integration

The avatar system has been successfully integrated with the world builder! Users
can now walk around their created worlds with their customized avatars.

## Key Features Implemented

### 1. Avatar Controller Component (`/src/components/world-builder/AvatarController.tsx`)

- Real-time avatar movement with keyboard controls
- WASD or arrow keys for movement
- Shift key for running
- Third-person camera that follows the avatar automatically
- Detailed avatar mesh rendering based on customization data

### 2. Avatar World Integration Component (`/src/components/world-builder/AvatarWorldIntegration.tsx`)

- Manages avatar presence in the world
- Shows control hints for new users
- Integrates with the avatar store to use the selected avatar

### 3. World Builder Updates

- New "Avatar" mode added to the editor modes
- Avatar mode button in the UI (with user icon)
- Automatic camera control switching between modes
- Disabled orbit controls when in avatar mode

## How to Use

1. **Select an Avatar**
   - Go to `/avatar` page
   - Create or select an avatar
   - Make sure it's set as your selected avatar

2. **Enter World Builder**
   - Navigate to `/worlds/builder`
   - Click the "아바타" (Avatar) button in the mode selector
   - Your avatar will appear in the world

3. **Controls**
   - **W/A/S/D** or **Arrow Keys**: Move the avatar
   - **Shift**: Hold to run
   - Camera automatically follows the avatar in third-person view

## Test Page

Visit `/test-avatar-world` to see a dedicated test page that:

- Shows your currently selected avatar
- Provides instructions on how to use the avatar in worlds
- Links to both avatar selection and world builder

## Technical Details

### Avatar Movement System

- Movement speed: 5 units/second (walking), 10 units/second (running)
- Rotation speed: 2 radians/second
- Camera distance: 8 units behind avatar
- Camera height: 4 units above ground
- Smooth camera following with lerp factor of 0.1

### Avatar Rendering

The avatar mesh includes:

- Body with customizable skin color and body type scaling
- Hair with style and color customization
- Clothing (top and bottom) with color support
- Face features (eyes with customizable color)
- Shadow for better grounding

### State Management

- Uses Zustand avatar store for selected avatar
- Avatar mode state managed in WorldBuilder component
- Position updates handled locally with optional callbacks

## Future Enhancements

1. **Animation System**
   - Walking/running animations
   - Idle animations
   - Emote system

2. **Physics Integration**
   - Collision detection with world objects
   - Gravity and jumping
   - Interaction with physics-enabled objects

3. **Multiplayer Support**
   - Show other users' avatars
   - Real-time position synchronization
   - Avatar interaction features

4. **Advanced Features**
   - Avatar-specific abilities
   - Customizable movement speeds
   - First-person view option
   - Sitting on furniture objects
