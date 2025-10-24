import React from 'react';
import { Form, DatePicker } from 'antd';
import type { FormItemProps } from 'antd';
import type { DatePickerProps } from 'antd/es/date-picker';

interface FormDatePickerProps extends FormItemProps {
  datePickerProps?: DatePickerProps;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  datePickerProps,
  ...formItemProps
}) => {
  return (
    <Form.Item {...formItemProps}>
      <DatePicker {...datePickerProps} style={{ width: '100%' }} />
    </Form.Item>
  );
};

export default FormDatePicker;
