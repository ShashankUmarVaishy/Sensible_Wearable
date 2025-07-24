# Sensible Wearable 🏥

A comprehensive healthcare monitoring mobile application built with React Native and Expo, designed to help patients manage their health with the assistance of caretakers and healthcare providers.

## 📱 Features

### Core Functionality
- **User Authentication** - Secure login and signup system
- **Patient-Caretaker Management** - Connect patients with their caretakers
- **Medication Reminders** - Smart notification system for medication schedules
- **Health Monitoring** - Real-time health stats tracking and visualization
- **Bluetooth Integration** - Connect with wearable devices for health data collection
- **Push Notifications** - Real-time alerts and reminders
- **QR Code Generation** - Easy sharing and connection between users

### Key Screens
- **Dashboard** - Overview of health status and quick actions
- **Profile Management** - Personal information and settings
- **Patients/Caretakers** - Manage connections and relationships
- **Device Connection** - Bluetooth device pairing and management
- **Medication Tracking** - Schedule and track medication intake
- **Health Statistics** - Visualize health data and trends

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sensible_wearable
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

### Running on Different Platforms

- **Android**: `npm run android` or `npx expo run:android`
- **iOS**: `npm run ios` or `npx expo run:ios`
- **Web**: `npm run web` or `npx expo start --web`

## 📋 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint for code quality
- `npm run reset-project` - Reset project to clean state

## 🔐 Permissions

The app requires the following permissions:

### Android
- Camera access
- Audio recording
- Boot completed receiver
- Vibration
- Wake lock
- Full screen intent
- System alert window
- Foreground service

### iOS
- Camera access
- Microphone access
- Bluetooth connectivity

## 🔄 Background Services

The app includes background task management for:
- Continuous health monitoring
- Medication reminder notifications
- Bluetooth device connectivity
- Data synchronization

## 📱 Device Compatibility

- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 11.0+
- **Web**: Modern browsers with WebRTC support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the [Expo documentation](https://docs.expo.dev/) for platform-specific issues

## 🔮 Future Enhancements

- [ ] Advanced health analytics and AI insights
- [ ] Integration with more wearable devices
- [ ] Telemedicine video calling
- [ ] Prescription management system
- [ ] Emergency contact automation
- [ ] Multi-language support
- [ ] Dark mode theme

---

Built with ❤️ for better healthcare management
