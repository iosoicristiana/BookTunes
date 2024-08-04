import React, { useEffect, useState, useRef } from "react";
import { EpubView } from "react-reader";
import { useParams } from "react-router-dom";
import { Layout, Button, Menu } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import "./Reader.css"; // Create this CSS file for custom styles

const { Content, Sider } = Layout;

const Reader = () => {
  const { id: bookId } = useParams();
  const [epubData, setEpubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [tocVisible, setTocVisible] = useState(false);
  const [toc, setToc] = useState([]);
  const viewerRef = useRef(null);

  useEffect(() => {
    const fetchBookContent = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/fetch-epub?book_id=${bookId}`
        );
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();

          reader.onload = function (e) {
            setEpubData(e.target.result);
            setLoading(false);
          };

          reader.readAsArrayBuffer(blob);
        } else {
          console.error("Error fetching book content:", response.statusText);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching book content:", error);
        setLoading(false);
      }
    };

    fetchBookContent();
  }, [bookId]);

  const onLocationChanged = (epubcifi) => {
    setLocation(epubcifi);
  };

  const onTocChange = (toc) => {
    setToc(toc);
  };

  const handleTocToggle = () => {
    setTocVisible(!tocVisible);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout className="reader-layout">
      <div className="toc-toggle">
        <Button
          icon={tocVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={handleTocToggle}
        />
      </div>
      <Layout>
        {tocVisible && (
          <Sider className="toc-menu" width={250} theme="light">
            <Menu
              mode="vertical"
              items={toc.map((item) => ({
                key: item.href,
                label: item.label,
                onClick: () => setLocation(item.href),
              }))}
            />
          </Sider>
        )}
        <Content className="content">
          {epubData ? (
            <EpubView
              ref={viewerRef}
              url={epubData}
              location={location}
              locationChanged={onLocationChanged}
              tocChanged={onTocChange}
              loadingView={<div>Loading ePub...</div>}
            />
          ) : (
            <div>Error loading book content.</div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Reader;
