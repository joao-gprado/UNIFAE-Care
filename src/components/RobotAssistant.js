// src/components/RobotAssistant.js

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
} from 'react-native-svg';

export default function RobotAssistant({
  size = 110,
}) {
  const exerciseAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const exerciseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(exerciseAnim, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exerciseAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const startBlinking = () => {
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(startBlinking, Math.random() * 3000 + 2000);
      });
    };

    exerciseLoop.start();
    startBlinking();

    return () => {
      exerciseLoop.stop();
    };
  }, []);

  const translateY = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -size * 0.25],
  });

  const shadowScale = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  const shadowOpacity = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.05],
  });

  const armRotationLeft = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '165deg'], 
  });
  
  const armRotationRight = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '-165deg'], 
  });

  const legRotationLeft = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5deg', '40deg'], 
  });
  
  const legRotationRight = exerciseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '-40deg'], 
  });

  const eyeOpacity = blinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size * 1.1 }]}>
      <Animated.View style={[
        styles.shadow,
        {
          width: size * 0.6,
          height: size * 0.08,
          transform: [{ scaleX: shadowScale }],
          opacity: shadowOpacity,
        }
      ]} />

      <Animated.View style={{ 
        transform: [{ translateY }],
        alignItems: 'center'
      }}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFDBAC" />
              <Stop offset="100%" stopColor="#F1C27D" />
            </LinearGradient>
            <LinearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FF416C" />
              <Stop offset="100%" stopColor="#FF4B2B" />
            </LinearGradient>
          </Defs>

          <G transform="translate(0, -5)">
            <Ellipse cx="100" cy="75" rx="42" ry="48" fill="url(#skinGrad)" />
            <Path d="M58 75 Q58 30 100 30 Q142 30 142 75 L146 65 Q100 10 54 65 Z" fill="#2D3436" />
            <Path d="M58 52 Q100 42 142 52" stroke="#FF4B2B" strokeWidth="10" fill="none" />

            <AnimatedG style={{ opacity: eyeOpacity }}>
              <Circle cx="82" cy="80" r="4.5" fill="#2D3436" />
              <Circle cx="118" cy="80" r="4.5" fill="#2D3436" />
            </AnimatedG>
            
            <AnimatedG style={{ opacity: blinkAnim }}>
               <Path d="M78 80 L86 80 M114 80 L122 80" stroke="#2D3436" strokeWidth="1.5" />
            </AnimatedG>

            <Path d="M88 100 Q100 112 112 100" stroke="#2D3436" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <Circle cx="75" cy="95" r="4" fill="#FF4B2B" opacity="0.15" />
            <Circle cx="125" cy="95" r="4" fill="#FF4B2B" opacity="0.15" />
          </G>

          <G transform="translate(85, 140)">
            <AnimatedG style={{ transform: [{ rotate: legRotationLeft }] }}>
              <Path d="M0 0 L0 35" stroke="#2D3436" strokeWidth="16" strokeLinecap="round" />
              <Circle cx="0" cy="40" r="8" fill="#FF4B2B" />
            </AnimatedG>
          </G>

          <G transform="translate(115, 140)">
            <AnimatedG style={{ transform: [{ rotate: legRotationRight }] }}>
              <Path d="M0 0 L0 35" stroke="#2D3436" strokeWidth="16" strokeLinecap="round" />
              <Circle cx="0" cy="40" r="8" fill="#FF4B2B" />
            </AnimatedG>
          </G>

          {/* CORPO - Gola ajustada para uma curva U profunda descendo para não cruzar com a cabeça */}
          <Path
            d="M61 150 L139 150 L145 110 Q100 135 55 110 Z"
            fill="url(#shirtGrad)"
          />

          <G transform="translate(60, 115)">
            <AnimatedG style={{ transform: [{ rotate: armRotationLeft }] }}>
               <Path d="M0 0 L0 35" stroke="#F1C27D" strokeWidth="16" strokeLinecap="round" />
               <Circle cx="0" cy="40" r="8" fill="#F1C27D" />
            </AnimatedG>
          </G>

          <G transform="translate(140, 115)">
            <AnimatedG style={{ transform: [{ rotate: armRotationRight }] }}>
               <Path d="M0 0 L0 35" stroke="#F1C27D" strokeWidth="16" strokeLinecap="round" />
               <Circle cx="0" cy="40" r="8" fill="#F1C27D" />
            </AnimatedG>
          </G>

        </Svg>
      </Animated.View>
    </View>
  );
}

const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadow: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 40,
  },
});