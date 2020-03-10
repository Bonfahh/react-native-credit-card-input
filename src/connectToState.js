import React, { Component } from "react";
import PropTypes from "prop-types";
import valid from "card-validator";
import CCFieldFormatter from "./CCFieldFormatter";
import CCFieldValidator from "./CCFieldValidator";
import compact from "lodash.compact";

valid.creditCardType.addCard({
  niceType: "Alelo",
  type: "alelo",
  patterns: [
    506699,
    506700,
    506701,
    506702,
    506703,
    506704,
    506705,
    506706,
    506709,
    506710,
    506711,
    506712,
    506713,
    506714,
    506716,
    506737,
    506738,
    506754,
    506755,
    506756,
    506757,
    506758,
    506759,
    506760,
    506761,
    506762,
    506763,
    506764,
    506765,
    506766,
    506767,
    506769,
    506770,
    506771,
    506772,
    506773,
  ],
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: "CVV",
    size: 3,
  },
});

valid.creditCardType.addCard({
  niceType: "Vr",
  type: "vr",
  patterns: [
    627416,
    637036,
    637037,
  ],
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: "CVV",
    size: 3,
  },
});

valid.creditCardType.addCard({
  niceType: "Ticket",
  type: "ticket",
  patterns: [
    602651,
    603342,
  ],
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: "CVV",
    size: 3,
  },
});

valid.creditCardType.addCard({
  niceType: "Sodexo",
  type: "sodexo",
  patterns: [
    603389,
    606068,
    606069,
    606071,
  ],
  gaps: [4, 8, 12],
  lengths: [16],
  code: {
    name: "CVV",
    size: 3,
  },
});


export const InjectedProps = {
  focused: PropTypes.string,
  values: PropTypes.object.isRequired,
  status: PropTypes.object.isRequired,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onBecomeEmpty: PropTypes.func.isRequired,
  onBecomeValid: PropTypes.func.isRequired,
  requiresName: PropTypes.bool,
  requiresCVC: PropTypes.bool,
  requiresPostalCode: PropTypes.bool,
};

export default function connectToState(CreditCardInput) {
  class StateConnection extends Component {
    static propTypes = {
      autoFocus: PropTypes.bool,
      onChange: PropTypes.func.isRequired,
      onFocus: PropTypes.func,
      requiresName: PropTypes.bool,
      requiresCVC: PropTypes.bool,
      requiresPostalCode: PropTypes.bool,
      validatePostalCode: PropTypes.func,
    };

    static defaultProps = {
      autoFocus: false,
      onChange: () => {},
      onFocus: () => {},
      requiresName: false,
      requiresCVC: true,
      requiresPostalCode: false,
      validatePostalCode: (postalCode = "") => {
        return postalCode.match(/^\d{6}$/) ? "valid" :
               postalCode.length > 6 ? "invalid" :
               "incomplete";
      },
    };

    constructor() {
      super();
      this.state = {
        focused: "",
        values: {},
        status: {},
      };
    }

    componentDidMount = () => setTimeout(() => { // Hacks because componentDidMount happens before component is rendered
      this.props.autoFocus && this.focus("number");
    });

    setValues = values => {
      const newValues = { ...this.state.values, ...values };
      const displayedFields = this._displayedFields();
      const formattedValues = (new CCFieldFormatter(displayedFields)).formatValues(newValues);
      const validation = (new CCFieldValidator(displayedFields, this.props.validatePostalCode)).validateValues(formattedValues);
      const newState = { values: formattedValues, ...validation };

      this.setState(newState);
      this.props.onChange(newState);
    };

    focus = (field = "number") => {
      this.setState({ focused: field });
    };

    _displayedFields = () => {
      const { requiresName, requiresCVC, requiresPostalCode } = this.props;
      return compact([
        "number",
        "expiry",
        requiresCVC ? "cvc" : null,
        requiresName ? "name" : null,
        requiresPostalCode ? "postalCode" : null,
      ]);
    };

    _focusPreviousField = field => {
      const displayedFields = this._displayedFields();
      const fieldIndex = displayedFields.indexOf(field);
      const previousField = displayedFields[fieldIndex - 1];
      if (previousField) this.focus(previousField);
    };

    _focusNextField = field => {
      if (field === "name") return;
      // Should not focus to the next field after name (e.g. when requiresName & requiresPostalCode are true
      // because we can't determine if the user has completed their name or not)

      const displayedFields = this._displayedFields();
      const fieldIndex = displayedFields.indexOf(field);
      const nextField = displayedFields[fieldIndex + 1];
      if (nextField) this.focus(nextField);
    };

    _change = (field, value) => {
      this.setValues({ [field]: value });
    };

    _onFocus = (field) => {
      this.focus(field);
      this.props.onFocus(field);
    };

    render() {
      return (
        <CreditCardInput
          {...this.props}
          {...this.state}
          onFocus={this._onFocus}
          onChange={this._change}
          onBecomeEmpty={this._focusPreviousField}
          onBecomeValid={this._focusNextField} />
      );
    }
  }

  return StateConnection;
}
