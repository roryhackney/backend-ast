const validateInteger = {
    validator: Number.isInteger,
    message: (props) => `${props.value} must be an integer.`
};

export default validateInteger;