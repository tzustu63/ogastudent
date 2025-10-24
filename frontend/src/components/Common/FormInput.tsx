import React from 'react';
import { Form, Input } from 'antd';
import type { FormItemProps } from 'antd';
import type { InputProps } from 'antd/es/input';

interface FormInputProps extends FormItemProps {
  inputProps?: InputProps;
}

const FormInput: React.FC<FormInputProps> = ({ inputProps, ...formItemProps }) => {
  return (
    <Form.Item {...formItemProps}>
      <Input {...inputProps} />
    </Form.Item>
  );
};

export default FormInput;
