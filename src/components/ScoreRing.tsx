import React, { useEffect, useState } from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  score: number;
  size?: number;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return colors.scoreHigh;
  if (score >= 5) return colors.scoreMid;
  return colors.scoreLow;
}

export default function ScoreRing({ score, size = 160 }: Props) {
  const [animatedValue] = useState(() => new Animated.Value(0));
  const [displayScore] = useState(() => new Animated.Value(0));

  const strokeWidth = size * 0.075;
  const scoreColor = getScoreColor(score);

  // animatedValue/displayScore are stable (from useState's lazy initializer) — only
  // re-run when the score itself changes.
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score / 10,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    Animated.timing(displayScore, {
      toValue: score,
      duration: 1400,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // On web, use a simple animated circle via CSS-style approach
  if (Platform.OS === 'web') {
    return <WebScoreRing score={score} size={size} color={scoreColor} />;
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.svgWrapper}>
        {/* Background ring */}
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: 'rgba(255,255,255,0.15)',
            position: 'absolute',
          }}
        />
        {/* Score text — Cormorant Garamond editorial */}
        <Animated.Text
          style={[
            styles.scoreText,
            { fontSize: size * 0.38, color: '#FFFFFF' },
          ]}
        >
          {displayScore.interpolate({
            inputRange: [0, 10],
            outputRange: ['0', '10'],
          })}
        </Animated.Text>
        <Text style={[styles.outOf, { fontSize: size * 0.12 }]}>/10</Text>
      </View>
    </View>
  );
}

function WebScoreRing({ score, size, color }: { score: number; size: number; color: string }) {
  const strokeWidth = size * 0.075;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* @ts-ignore web only */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        {/* @ts-ignore web only */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
        />
        {/* @ts-ignore web only */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s ease' }}
        />
      </svg>
      <Text style={[styles.scoreText, { fontSize: size * 0.38, color: '#FFFFFF' }]}>
        {score}
      </Text>
      <Text style={[styles.outOf, { fontSize: size * 0.12, color: 'rgba(255,255,255,0.55)' }]}>/10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  scoreText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: undefined,
  },
  outOf: {
    fontFamily: 'DMSans_500Medium',
    color: 'rgba(255,255,255,0.55)',
  },
});
