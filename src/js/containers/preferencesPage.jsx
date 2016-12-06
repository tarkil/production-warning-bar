import React from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import { connect } from 'react-redux';


import WarningBarPreferences from './warningBarPreferences.jsx';
import { savePreferences } from '../actions/actionsType'



class Preferences extends React.Component {
    render() {
        return (
            <div>
                <AppBar
                    title="Enhanced Warning Production Bar"
                    iconElementRight={ <FlatButton label="Save"
                                onClick={e => {
                                         e.preventDefault();
                                         this.props.onSaveClick();
                                       }}/> }
                />
                <WarningBarPreferences />
            </div>
        );
    }
}

Preferences.propTypes = {
    onSaveClick: React.PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onSaveClick: () => {
            dispatch(savePreferences());
        }
    }
};

const PreferencesPage = connect(
    mapStateToProps,
    mapDispatchToProps
)(Preferences);


export default PreferencesPage;