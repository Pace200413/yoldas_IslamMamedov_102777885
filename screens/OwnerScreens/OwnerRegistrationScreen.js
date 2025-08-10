import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerRegistrationScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>

      {/* Top bar with back arrow */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Illustration */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../assets/restaurants/2.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Title and description */}
      <Text style={styles.title}>Create a restaurant</Text>
      <Text style={styles.subtitle}>
        Input general information about your restaurant including opening time and social media links
      </Text>

      {/* Buttons row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignInScreen')}
            >
            <Text style={styles.primaryButtonText}>Sign in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.primaryButtonText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Social icons row */}
      <View style={styles.socialRow}>
        <Ionicons name="logo-google" size={28} color="#374151" style={styles.socialIcon} />
        <Ionicons name="logo-facebook" size={28} color="#374151" style={styles.socialIcon} />
        <Ionicons name="logo-apple" size={28} color="#374151" style={styles.socialIcon} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // white background
    paddingHorizontal: 20,
  },
  topBar: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 260,
    height: 260,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db', // light gray inactive
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#10b981', // active green
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937', // dark text
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280', // gray-500 text
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 24,
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  socialIcon: {
    marginHorizontal: 10,
  },
});
