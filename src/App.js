import * as React from "react";
import { useMemo } from "react";
import { gen_DynResourceCreate } from "./DynResource";
import {
  AdminContext,
  AdminUI,
  defaultI18nProvider,
  localStorageStore,
  Loading,
  Resource,
  useDataProvider,
  usePermissions,
} from "react-admin";
import englishMessages from 'ra-language-english';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import { jsonapiClient } from "./rav4-jsonapi-client/ra-jsonapi-client";
import { useConf } from "./Config";
import ConfigurationUI, { LoadYaml } from "./components/ConfigurationUI";
import { Layout } from "./components/Layout";
import Home from "./components/Home.js";
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import authProvider from "./authprovider";
import { QueryClient } from "react-query";
import LoginPage from "./pages/LoginPage";
import gen_DynResourceList from "./components/DynList";
import { gen_DynResourceShow } from "./components/DynInstance";
import { gen_DynResourceEdit } from "./components/DynResourceEdit";

const messages = {
  'en': englishMessages,
};
const i18nProvider = polyglotI18nProvider(locale => messages[locale]);

const AsyncResources = () => {
  const [resources, setResources] = React.useState(false);
  const dataProvider = useDataProvider();
  const conf = useConf();
  React.useEffect(() => {
    dataProvider
      .getResources()
      .then((response) => {
        let res = Object.keys(response.data.resources).map((resource_name) => {
          return { name: resource_name };
        });
        setResources(res);
      })
      .catch((err) => {
        console.warn(err);
        setResources([]);
      });
  }, []);
  const resource_conf = "a";
  if (resources === false) {
    console.log("loading");
    return <div>Loading...</div>;
  }

  return (
    <AdminUI
      ready={Loading}
      layout={Layout}
      loginPage={LoginPage}
      disableTelemetry
    >
      <Resource
        name="Home"
        show={Home}
        list={Home}
        options={{ label: "Home" }}
        icon={HomeIcon}
      />
      <Resource
        name="Configuration"
        show={ConfigurationUI}
        list={ConfigurationUI}
        options={{ label: "Configuration" }}
        icon={SettingsIcon}
      />
      {
        resources.map((resource) => (
          <Resource
            name={resource.name}
            key={resource.name}
            list={gen_DynResourceList(conf.resources[resource.name])}
            create={gen_DynResourceCreate(conf.resources[resource.name])}
            edit={gen_DynResourceEdit(conf.resources[resource.name])}
            show={gen_DynResourceShow(conf.resources[resource.name])}
            label={(() => {
              if (
                conf.resources[resource.name].label &&
                conf.resources[resource.name].label !=
                  conf.resources[resource.name].name
              ) {
                return resource_conf.label;
              }
            })()}
          />
        ))
        // <Resource name="Dashboard" show={Dashboard} list={Dashboard} options={{ label: 'Dashboard' }} icon={DashboardIcon}/>
      }
    </AdminUI>
  );
};

// App component
const App = () => {
  const conf = useConf();
  const dataProvider = jsonapiClient(conf.api_root, {});
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
  return (
    <AdminContext
      dataProvider={dataProvider}
      authProvider={authProvider}
      queryClient={queryClient}
      locale="en"
      i18nProvider={i18nProvider}
    >
      <AsyncResources />
    </AdminContext>
  );
};

export default App;
