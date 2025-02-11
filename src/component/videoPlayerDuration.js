import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import {mockResponse} from '../mockResponse/videoPlayerResponse';

const VideoPlayerDuration = () => {
  const [clicked, setClicked] = useState(false);
  const [puased, setPaused] = useState(false);
  const [progress, setProgress] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoList, setVideoList] = useState(mockResponse);
  const ref = useRef();

  const format = seconds => {
    let mins = parseInt(seconds / 60)
      .toString()
      .padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleFormat = seconds => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(Math.trunc(seconds) % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Update video duration at a given index
  const addDurationAtIndex = (index, duration) => {
    setVideoList(prevVideoList => {
      return prevVideoList.map((video, i) =>
        i === index ? {...video, duration: handleFormat(duration)} : video,
      );
    });
  };

  const renderVideoItem = (item, index) => {
    return (
      <TouchableOpacity
        testID={'video-item-btn'}
        style={[styles.commonBox]}
        onPress={() => {
          setPaused(false);
          setCurrentVideoIndex(index);
        }}>
        <Video
          poster={item.thumb}
          paused={true}
          source={{
            uri: item.sources,
          }}
          testID="video-play-item-id"
          onLoad={value => {
            addDurationAtIndex(index, value.duration);
          }}
          style={styles.listVideoContainer}
          posterResizeMode="cover"
          resizeMode="cover"
        />
        <View style={styles.recentMatchListImage}>
          <View style={styles.recentMatchListTeamName}>
            <View style={styles.recentPlayContant} />
            <Image
              style={styles.recentMatchListPlayButtonImage}
              source={
                currentVideoIndex == index
                  ? require('../assets/icons8-dots-loading.gif')
                  : require('../assets/play-button.png')
              }
              resizeMode="contain"
            />
            <View style={styles.videoListTitleContainer}>
              <View style={{flex: 0.8}}>
                <Text style={[{color: 'black'}, styles.font900]}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.durationContainer}>
                <Text style={[{color: 'red'}, styles.font900]}>
                  {item.duration}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const {height} = Dimensions.get('window');
  return (
    <SafeAreaView style={{flex: 1}}>
      <TouchableOpacity
        style={{
          width: '100%',
          height: fullScreen ? '100%' : 200,
          marginTop: Platform.OS == 'ios' ? 10 : 0,
        }}
        onPress={() => {
          setClicked(!clicked);
        }}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        <Video
          poster={videoList[currentVideoIndex].thumb}
          posterResizeMode="cover"
          source={{
            uri: videoList[currentVideoIndex].sources,
          }}
          paused={puased}
          onLoadStart={value => {
            setLoading(true);
          }}
          onLoad={value => {
            setLoading(false);
          }}
          ref={ref}
          onProgress={x => {
            setProgress(x);
          }}
          style={{width: '100%', height: fullScreen ? '100%' : 200}}
          resizeMode="cover"
        />
        {clicked && (
          <View style={styles.controlMainContainer}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() => {
                  ref.current.seek(parseInt(progress?.currentTime || 0) - 10);
                }}>
                <Image
                  source={require('../assets/backward.png')}
                  style={{width: 30, height: 30, tintColor: 'white'}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPaused(!puased);
                }}>
                <Image
                  source={
                    puased
                      ? require('../assets/play-button.png')
                      : require('../assets/pause.png')
                  }
                  style={styles.pauseContainer}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  ref.current.seek(parseInt(progress?.currentTime || 0) + 10);
                }}>
                <Image
                  source={require('../assets/forward.png')}
                  style={styles.pauseContainer}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomContainer}>
              <Text style={{color: '#fff'}}>
                {format(progress?.currentTime || 0)}
              </Text>
              <Slider
                value={progress?.currentTime || 0}
                style={{width: '80%', height: 40}}
                minimumValue={0}
                maximumValue={progress?.seekableDuration || 0}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#fff"
                onValueChange={x => {
                  ref.current.seek(x);
                  setProgress(prev => ({
                    ...prev,
                    currentTime: x,
                  }));
                }}
              />
              <Text style={{color: '#fff'}}>
                {format(progress?.seekableDuration || 0)}
              </Text>
            </View>
            <View style={styles.fullscreenContainer}>
              <TouchableOpacity
                onPress={() => {
                  if (fullScreen) {
                    Orientation.unlockAllOrientations();
                    Orientation.lockToPortrait();
                  } else {
                    Orientation.unlockAllOrientations();
                    Orientation.lockToLandscape();
                  }
                  setFullScreen(!fullScreen);
                }}>
                <Image
                  source={
                    fullScreen
                      ? require('../assets/minimize.png')
                      : require('../assets/full-size.png')
                  }
                  style={{width: 24, height: 24, tintColor: '#fff'}}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
      <View style={{padding: 10}}>
        <Text style={{paddingHorizontal: 10}}>Video List</Text>
        <FlatList
          testID="video-list"
          data={videoList}
          contentContainerStyle={{flexGrow: 1, paddingBottom: 200}}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item?.id + index?.toString()}
          renderItem={({item, index}) => renderVideoItem(item, index)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  controlMainContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseContainer: {
    width: 30,
    height: 30,
    tintColor: 'white',
    marginLeft: 50,
  },
  bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
  fullscreenContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 10,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  },
  commonBox: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'black',
    marginVertical: 10,
    height: 180,
  },
  recentMatchListTeamName: {
    flex: 1,
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  recentMatchListImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
    justifyContent: 'center',
    alignContent: 'center',
  },
  recentPlayContant: {
    opacity: 0,
    flexDirection: 'row',
    padding: 0,
    height: 18,
  },
  recentMatchListPlayButtonImage: {
    height: 40,
    width: 40,
    alignSelf: 'center',
  },
  playIcon: {position: 'absolute', top: 0, width: '100%', marginTop: 60},
  listVideoContainer: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    opacity: 0.6,
  },
  videoListTitleContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  durationContainer: {
    flex: 0.2,
    alignItems: 'flex-end',
  },
  font900: {
    fontWeight: 9000,
  },
});

export default VideoPlayerDuration;
