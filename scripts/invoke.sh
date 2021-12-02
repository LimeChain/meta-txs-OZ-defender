source app/.env
echo "Invoking https://api.defender.openzeppelin.com/autotasks/fde7d96d-fefe-432a-bf40-31db5bd3c233/runs/webhook/78bfd8db-8112-4e20-867a-511f61557714/2qKPbeov2qx9LcBY2mfh5P..."
curl -s -XPOST "https://api.defender.openzeppelin.com/autotasks/fde7d96d-fefe-432a-bf40-31db5bd3c233/runs/webhook/78bfd8db-8112-4e20-867a-511f61557714/2qKPbeov2qx9LcBY2mfh5P" -d "@./tmp/request.json" -H "Content-Type: application/json" | jq -r 'if .status == "success" then (.result | fromjson | .txHash) else {result,message,status} end'


