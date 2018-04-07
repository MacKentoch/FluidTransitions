import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/*
  This HOC wrapper creates animatable wrappers around the provided component
  to make it animatable - independent of wether it is a stateless or class
  component.

  In addition it wraps the element in two outer animatable components - one
  for transform animations that can be used with the native driver, and one
  for other properties that can be animated using a non-native animation driver.

  Example component:

  <View style={{ backgroundColor: #F00, transform: [{ rotate: '90deg' }] }}>
    <Text>Hello World</Text>
  </View>

  Results in the following component hierarchy where
  the outer views are animatable views:

  <View style={{ transform: [{ rotate: '90deg' }] }}>  <-- Native Animated Component
    <View style={{ backgroundColor: #F00, flex: 1 }} > <-- Animated Component
      <View style={flex: 1}>                           <-- Org. component
        <Text>Hello World</Text>
      </View>
    </View>
  </View>

  Parameters:
  component:    The component to create wrapper for. Can be a regular class based or
                stateless component.
  nativeStyles: Styles for the native part of the wrapper. Put any native animations
                (transforms & opacity) here. (optional)
  styles:       Styles for the non-native animations (optional)
  nativeCached: Provide a cached AnimatedComponent wrapper for the native part (optional)
  cached:       Provide a cached AnimatedComponent wrapper for the non-native part (optional)
*/
const createAnimatedWrapper = (
  component: any,
  nativeStyles: ?StyleSheet.NamedStyles,
  styles: ?StyleSheet.NamedStyles,
  nativeCached: ?any,
  cached: any,
) => {
  
  // Create wrapped views
  const nativeAnimatedComponent = nativeCached || createAnimated();
  const animatedComponent = cached || createAnimated();

  // Get styles
  const nativeAnimatedStyles = getNativeAnimatableStyles(component.props.style);
  const animatedStyles = getAnimatableStyles(component.props.style);
  const componentStyles = getComponentStyles(component.props.style);

  // create inner element
  const innerElement = React.createElement(component.type, {
    ...component.props,
    style: componentStyles,
  });

  // Create Animated element
  const animatedElement = React.createElement(
    animatedComponent, { style: [animatedStyles, styles, { overflow: 'hidden' } ], },
    innerElement,
  );

  // Setup props for the outer wrapper (and native animated component)
  let props = {
    collapsable: false, // Used to fix measure on Android    
    style: [
      nativeAnimatedStyles,
      nativeStyles,      
    ],
  };

  if (component.key) { props = { ...props, key: component.key }; }
  if (component.ref) { props = { ...props, ref: component.ref }; }
  if (component.onLayout) { props = { ...props, onLayout: component.onLayout }; }

  // Create native animated component
  const nativeAnimatedElement = React.createElement(
    nativeAnimatedComponent,
    props, animatedElement,
  );

  return nativeAnimatedElement;
};

const createAnimated = () => {
  // Create wrapped view
  const wrapper = (<View />);
  return Animated.createAnimatedComponent(wrapper.type);
};

const getNativeAnimatableStyles = (styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles) =>
  getFilteredStyle(styles, (key) => includePropsForNativeStyles.indexOf(key) > -1);

const getAnimatableStyles = (styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles) =>
  getFilteredStyle(styles, (key) => excludePropsForStyles.indexOf(key) === -1);

  const getComponentStyles = (styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles) =>
  getFilteredStyle(styles, (key) => excludePropsForComponent.indexOf(key) === -1);

const getFilteredStyle = (
  styles: Array<StyleSheet.NamedStyles>|StyleSheet.NamedStyles,
  shouldIncludeKey: (key: String) => void,
) => {
  if (!styles) return styles;
  let flattenedStyle = styles;
  if (!(styles instanceof Object)) {
    flattenedStyle = StyleSheet.flatten(styles);
  }

  if (!flattenedStyle) return styles;
  if (!(flattenedStyle instanceof Array)) {
    flattenedStyle = [flattenedStyle];
  }

  const retVal = {};
  flattenedStyle.forEach(s => {
    if (s) {
      const keys = Object.keys(s);
      keys.forEach(key => {
        if (!isNumber(key) && shouldIncludeKey(key)) {
          retVal[key] = s[key];
        }
      });
    }
  });

  return retVal;
};

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0); }

const excludePropsForComponent = [
  'display',
  // 'width',
  // 'height',
  'start',
  'end',
  'top',
  'left',
  'right',
  'bottom',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  "padding",
  "paddingVertical",
  "paddingHorizontal",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingStart",
  "paddingEnd",
  'position',  
  'flexWrap',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'aspectRatio',
  'zIndex',
  'direction',
  'transform',
  "transformMatrix",
  "decomposedMatrix",
  "scaleX",
  "scaleY",
  "rotation",
  "translateX",
  "translateY",
  'backfaceVisibility',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderStartColor',
  'borderEndColor',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderTopStartRadius',
  'borderTopEndRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderBottomStartRadius',
  'borderBottomEndRadius',
  'borderStyle',
];

const includePropsForNativeStyles = [
  'display',
  'width',
  'height',
  'start',
  'end',
  'top',
  'left',
  'right',
  'bottom',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  // "padding",
  // "paddingVertical",
  // "paddingHorizontal",
  // "paddingTop",
  // "paddingBottom",
  // "paddingLeft",
  // "paddingRight",
  // "paddingStart",
  // "paddingEnd",
  'position',
  'flexDirection',
  'flexWrap',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'aspectRatio',
  'zIndex',
  'direction',
  'transform',
  // "transformMatrix",
  // "decomposedMatrix",
  // "scaleX",
  // "scaleY",
  // "rotation",
  // "translateX",
  // "translateY",
  // 'backfaceVisibility',
  // 'backgroundColor',
  // 'borderColor',
  // 'borderTopColor',
  // 'borderRightColor',
  // 'borderBottomColor',
  // 'borderLeftColor',
  // 'borderStartColor',
  // 'borderEndColor',
  // 'borderRadius',
  // 'borderTopLeftRadius',
  // 'borderTopRightRadius',
  // 'borderTopStartRadius',
  // 'borderTopEndRadius',
  // 'borderBottomLeftRadius',
  // 'borderBottomRightRadius',
  // 'borderBottomStartRadius',
  // 'borderBottomEndRadius',
  // 'borderStyle',
];

const excludePropsForStyles = [
  'display',
  // "width",
  // "height",
  'start',
  'end',
  'top',
  'left',
  'right',
  'bottom',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginVertical',
  'marginHorizontal',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginStart',
  'marginEnd',
  // "padding",
  // "paddingVertical",
  // "paddingHorizontal",
  // "paddingTop",
  // "paddingBottom",
  // "paddingLeft",
  // "paddingRight",
  // "paddingStart",
  // "paddingEnd",
  // "borderWidth",
  // "borderTopWidth",
  // "borderStartWidth",
  // "borderEndWidth",
  // "borderRightWidth",
  // "borderBottomWidth",
  // "borderLeftWidth",
  'position',
  // "flexDirection",
  // "flexWrap",
  // "justifyContent",
  // "alignItems",
  'alignSelf',
  'alignContent',
  'overflow',
  // "flex",
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'aspectRatio',
  'zIndex',
  'direction',
  // 'shadowColor',
  // 'shadowOffset',
  // 'shadowOpacity',
  // 'shadowRadius',
  // 'elevation',
  'transform',
  'transformMatrix',
  'decomposedMatrix',
  'scaleX',
  'scaleY',
  'rotation',
  'translateX',
  'translateY',
  // 'backfaceVisibility',
  // 'backgroundColor',
  // 'borderColor',
  // 'borderTopColor',
  // 'borderRightColor',
  // 'borderBottomColor',
  // 'borderLeftColor',
  // 'borderStartColor',
  // 'borderEndColor',
  // 'borderRadius',
  // 'borderTopLeftRadius',
  // 'borderTopRightRadius',
  // 'borderTopStartRadius',
  // 'borderTopEndRadius',
  // 'borderBottomLeftRadius',
  // 'borderBottomRightRadius',
  // 'borderBottomStartRadius',
  // 'borderBottomEndRadius',
  // 'borderStyle',
  // 'opacity',
  'textAlign',
];

export { createAnimatedWrapper, createAnimated };
