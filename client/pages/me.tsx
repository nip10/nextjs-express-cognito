import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Layout from "../components/layout";

export default function MePage() {
  const { data } = useSession();
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    async function foo() {
      const res = await fetch("http://localhost:3001/restricted", {
        headers: {
          // @ts-expect-error
          accesstoken: data?.idToken,
        },
      });
      const json = await res.json();
      setApiResponse(json);
    }
    // @ts-expect-error
    if (data?.idToken) {
      foo();
    }
    // @ts-expect-error
  }, [data?.idToken]);

  return (
    <Layout>
      <div>
        <h2>Session Data</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      <div>
        <h2>Api Response</h2>
        <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
      </div>
    </Layout>
  );
}
