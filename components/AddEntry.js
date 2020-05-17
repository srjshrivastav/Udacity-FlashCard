import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import {
  getMatriceInfo,
  timeToString,
  getDailyReminderValue,
} from "../utils/helpers";
import Sliders from "./sliders";
import Stepper from "./steppers";
import DateHeader from "./DateHeader";
import TextBtn from "./Textbtn";
import { Octicons } from "@expo/vector-icons";
import { submitEntry, removeEntry } from "../utils/api";
import { connect } from "react-redux";
import { addEntry, receiveEntries } from "../actions";
import { white, purple } from "../utils/colors";

function SubmitBtn({ onPress }) {
  return (
    <TouchableOpacity
      style={Platform.OS === "ios" ? styles.iosBtn : styles.androidBtn}
      onPress={onPress}
    >
      <Text style={styles.SubmitBtn}>Submit</Text>
    </TouchableOpacity>
  );
}

class AddEntry extends React.Component {
  state = {
    run: 0,
    bike: 0,
    swim: 0,
    sleep: 0,
    eat: 0,
  };

  incremenet = (metric) => {
    const { max, step } = getMatriceInfo(metric);

    this.setState((state) => {
      const count = state[metric] + step;
      return {
        ...state,
        [metric]: count > max ? max : count,
      };
    });
  };
  decrement = (metric) => {
    this.setState((state) => {
      const count = state[metric] - getMatriceInfo(metric).step;
      return {
        ...state,
        [metric]: count < 0 ? 0 : count,
      };
    });
  };

  slide = (metric, value) => {
    this.setState(() => ({
      [metric]: value,
    }));
  };
  submit = () => {
    const key = timeToString();
    const entry = this.state;

    this.props.dispatch(
      addEntry({
        [key]: entry,
      })
    );

    submitEntry({ entry, key });
  };

  reset = () => {
    const key = timeToString();

    this.props.dispatch(
      addEntry({
        [key]: getDailyReminderValue(),
      })
    );

    removeEntry(key);
  };
  render() {
    const metaInfo = getMatriceInfo();

    if (this.props.alreadyLoggedIn) {
      return (
        <View>
          <Octicons name="thumbsup" size={40} />
          <Text>You already Logged your Information for today</Text>
          <TextBtn onPress={this.reset}>Reset</TextBtn>
        </View>
      );
    }

    return (
      <View>
        <DateHeader date={new Date().toLocaleDateString()} />
        {Object.keys(metaInfo).map((key) => {
          const { type, getIcons, ...rest } = metaInfo[key];
          const value = this.state[key];
          return (
            <View key={key}>
              {getIcons()}
              {type === "slider" ? (
                <Sliders
                  value={value}
                  onChange={(value) => this.slide(key, value)}
                  {...rest}
                />
              ) : (
                <Stepper
                  value={value}
                  onIncrement={this.incremenet}
                  onDecrement={this.decrement}
                  {...rest}
                />
              )}
            </View>
          );
        })}
        <SubmitBtn onPress={this.submit} />
      </View>
    );
  }
}
function mapStateToProps(state) {
  const key = timeToString();
  return {
    alreadyLoggedIn: state[key] && state[key].today === undefined,
  };
}

const styles = StyleSheet.create({
  iosBtn: {
    backgroundColor: purple,
    padding: 10,
    borderRadius: 7,
    height: 45,
    marginLeft: 40,
    marginRight: 40,
  },
  SubmitBtn: {
    color: white,
    fontSize: 22,
    textAlign: "center",
  },
  androidBtn: {
    backgroundColor: purple,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 2,
    height: 45,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default connect(mapStateToProps)(AddEntry);
