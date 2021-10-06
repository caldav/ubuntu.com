import React, { useEffect, useState } from "react";
import { Button, ContextualMenu, MainTable } from "@canonical/react-components";

const enum Status {
  Enrolled = "enrolled",
  NotEnrolled = "not-enrolled",
  Passed = "passed",
  Failed = "failed",
  InProgress = "In Progress",
}

const translateStatus = (status: Status) => {
  return {
    [Status.Enrolled]: "Enrolled",
    [Status.NotEnrolled]: "Not Enrolled",
    [Status.Passed]: "Passed",
    [Status.Failed]: "Failed",
    [Status.InProgress]: "In Progress",
  }[status];
};

const TableView = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getModules = async () => {
      try {
        const response = await fetch("microcerts.json");

        if (response.status === 200) {
          let { modules } = await response.json();
          modules = modules.map((module: Record<string, unknown>) => ({
            name: module["name"],
            badgeURL: module["badge-url"],
            topics: module["topics"],
            studyLabURL: module["study_lab"],
            takeURL: module["take_url"],
            status: module["status"],
          }));

          setModules(modules);
        }
      } catch {
        console.error("Error fetching data!");
      } finally {
        setIsLoading(false);
      }
    };
    getModules();
  }, []);

  const copyBadgeUrl = async (badgeUrl: string) => {
    try {
      await navigator.clipboard.writeText(badgeUrl);
    } catch {
      console.error("Failed to copy data to clipboard");
    }
  };

  const renderModuleName = (name: string, topics: Array<string>) => (
    <div>
      <h3 className="p-heading--5 u-no-margin u-no-padding">{name}</h3>
      <p className="u-text--muted u-hide--small">
        <small>{topics.length} topics</small>
      </p>
    </div>
  );

  const renderTopics = (topics: Array<string>) => (
    <ul className="p-list u-no-margin" style={{ whiteSpace: "normal" }}>
      {topics.map((topic) => (
        <li key={topic} className="p-list__item">
          {topic}
        </li>
      ))}
    </ul>
  );

  const renderStatus = (status: Status) => (
    <p className="u-no-padding--top">
      <>
        {status === Status.Passed ? (
          <i className="p-icon--success" />
        ) : status === Status.Failed ? (
          <i className="p-icon--error" />
        ) : null}
        {translateStatus(status)}
      </>
    </p>
  );

  const renderActions = (
    moduleName: string,
    badgeURL: string,
    studyLabURL: string,
    takeURL: string,
    status: Status
  ) => (
    <div className="u-no-padding--top u-align--right">
      {status === Status.Enrolled ? (
        <>
          <a
            className="p-button--neutral u-no-margin--right"
            href={studyLabURL}
          >
            Prepare
          </a>
          <a className="p-button--positive" href={takeURL}>
            Take
          </a>
        </>
      ) : status === Status.InProgress ? (
        <a className="p-button--positive" href={takeURL}>
          Resume
        </a>
      ) : status === Status.Passed ? (
        <ContextualMenu
          hasToggleIcon
          toggleLabel="Share"
          links={[
            {
              children: "Share via LinkedIn",
              element: "a",
              href: `https://www.linkedin.com/shareArticle?mini=true&amp;url=${badgeURL}`,
            },
            {
              children: "Share via Twitter",
              element: "a",
              href:
                `https://twitter.com/share?text=I earned ${moduleName} ` +
                `from @Canonical. Now I’m one step closer to becoming a ` +
                `Certified @Ubuntu Engineer. Learn more about ` +
                `Canonical’s available microcerts and CUBE 2020 at ` +
                `https://ubuntu.com/cube.&amp;url=${badgeURL}&amp;` +
                `hashtags=CUBE2020`,
            },
            {
              children: "Copy to clipboard",
              onClick: () => copyBadgeUrl(badgeURL),
            },
          ]}
        />
      ) : (
        <Button appearance={"positive"}>Purchase</Button>
      )}
    </div>
  );

  return (
    <MainTable
      responsive
      className="p-table--cube--grid"
      headers={[
        { content: "#" },
        { content: "" },
        { content: "Module" },
        { content: "Topics" },
        { content: "Status", className: "p-table__cell--icon-placeholder" },
        { content: "Action", className: "u-align--right" },
      ]}
      rows={modules.map(
        ({ name, badgeURL, topics, studyLabURL, takeURL, status }, index) => {
          return {
            key: name,
            columns: [
              {
                content: <span className="u-text--muted">{index + 1}</span>,
                className: "u-no-padding--right",
                "aria-label": "Module number",
              },
              {
                content: <img src={badgeURL} alt="" />,
                className: "p-table--cube--grid__module-logo",
              },
              {
                content: renderModuleName(name, topics),
                "aria-label": "Module",
              },
              {
                content: renderTopics(topics),
                "aria-label": "Topics",
              },
              {
                content: renderStatus(status),
                className: "p-table__cell--icon-placeholder",
                "aria-label": "Status",
              },
              {
                content: renderActions(
                  name,
                  badgeURL,
                  studyLabURL,
                  takeURL,
                  status
                ),
              },
            ],
          };
        }
      )}
      emptyStateMsg={
        isLoading ? (
          <p>
            <i className="p-icon--spinner u-animation--spin"></i>
          </p>
        ) : (
          <i>No data could be loaded</i>
        )
      }
    />
  );
};

export default TableView;
