import React from 'react';
import { Form, Select } from 'antd';
import type { FormItemProps } from 'antd';
import type { SelectProps } from 'antd/es/select';

interface FormSelectProps extends FormItemProps {
  selectProps?: SelectProps;
  options: { label: string; value: string | number }[];
}

const FormSelect: React.FC<FormSelectProps> = ({
  selectProps,
  options,
  ...formItemProps
}) => {
  return (
    <Form.Item {...formItemProps}>
      <Select {...selectProps} options={options} />
    </Form.Item>
  );
};

export default FormSelect;
