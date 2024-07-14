import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';

const TypeaheadWrapper = ({ id, options, selected, onChange, placeholder }) => {
    return (
        <Typeahead
            id={id}
            options={options}
            selected={selected}
            onChange={onChange}
            placeholder={placeholder}
            allowNew
            newSelectionPrefix="Add a new category: "
            className="me-2"
        />
    );
};

export default TypeaheadWrapper;
