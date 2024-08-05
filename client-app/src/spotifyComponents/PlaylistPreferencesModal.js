import React, { useEffect } from "react";
import { Modal, Select, Checkbox, Form, Button, Slider, Radio } from "antd";

const { Option } = Select;

const PlaylistPreferencesModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleFinish = (values) => {
    onSubmit(values);
  };

  const sliderMarks = {
    0: {
      style: { color: "#000" },
      label: <span style={{ whiteSpace: "nowrap" }}>Less Popular</span>,
    },
    100: {
      style: { color: "#000", textAlign: "right" },
      label: <span style={{ whiteSpace: "nowrap" }}>More Popular</span>,
    },
  };

  return (
    <Modal
      open={visible}
      title="Choose your playlist preferences"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          Generate
        </Button>,
      ]}
      centered
      styles={{ body: { padding: "20px" } }}
      style={{
        maxWidth: "90%",
        width: "400px",
        textAlign: "center",
      }}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        style={{ textAlign: "center" }}
        initialValues={{ popularity: [0, 100] }} // Set default value for the range slider
      >
        <Form.Item
          name="SoundtrackType"
          label="Soundtrack Type"
          style={{ marginBottom: "2rem" }}
          rules={[
            { required: true, message: "Please select a soundtrack type" },
          ]}
        >
          <Radio.Group style={{ display: "flex", justifyContent: "center" }}>
            <Radio.Button value="classical">Only classical music</Radio.Button>
            <Radio.Button value="other">All music genres</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="PopularityRange"
          label="Popularity of Songs"
          style={{ marginBottom: "2rem" }}
        >
          <Slider range marks={sliderMarks} min={0} max={100} />
        </Form.Item>

        <Form.Item
          name="Decades"
          label="Decades"
          style={{ marginBottom: "2rem" }}
        >
          <Select
            mode="multiple"
            placeholder="Select decades"
            style={{ width: "100%" }}
          >
            <Option value="1960s">1960s</Option>
            <Option value="1970s">1970s</Option>
            <Option value="1980s">1980s</Option>
            <Option value="1990s">1990s</Option>
            <Option value="2000s">2000s</Option>
            <Option value="2010s">2010s</Option>
            <Option value="2020s">2020s</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="UseSpotifyPreferences"
          valuePropName="checked"
          style={{ marginBottom: "2rem" }}
        >
          <Checkbox>I want the playlist to include my music taste.</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PlaylistPreferencesModal;
