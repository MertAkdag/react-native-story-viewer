"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoryHeader = StoryHeader;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _expoImage = require("expo-image");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * StoryHeader — Story Header Area
 *
 * Component displayed at the top of the story viewer:
 * - Left: Avatar image + Group/user name
 * - Right: Close (X) button
 *
 * Text shadow is applied to text and icons (readability over background image).
 */

function StoryHeader({
  avatarUrl,
  name,
  onClose,
  renderCloseButton
}) {
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: styles.container,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.userInfo,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_expoImage.Image, {
        source: {
          uri: avatarUrl
        },
        style: styles.avatar,
        contentFit: "cover"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: styles.name,
        numberOfLines: 1,
        children: name
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
      onPress: onClose,
      hitSlop: {
        top: 12,
        bottom: 12,
        left: 12,
        right: 12
      },
      style: styles.closeButton,
      children: renderCloseButton ? renderCloseButton() : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
        style: styles.defaultCloseIcon,
        children: "\u2715"
      })
    })]
  });
}
const styles = _reactNative.StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent' // Can be customized via theme later
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {
      width: 0,
      height: 1
    },
    textShadowRadius: 5,
    flexShrink: 1
  },
  closeButton: {
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  defaultCloseIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {
      width: 0,
      height: 1
    },
    textShadowRadius: 3
  }
});
//# sourceMappingURL=StoryHeader.js.map