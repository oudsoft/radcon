function OnStoredInstance(instanceId, tags, metadata)
	print("===========OnStoredInstance==============")
  print("===========WebsocketTrigger==============")

  -- create client:

  local websocket = require'websocket'
  local client = websocket.client.copas({timeout=2})

  -- connect to the server:

  local ok,err = client:connect('wss://172.17.0.6:9443','echo-protocol')
  if not ok then
     print('could not connect',err)
  end

  -- send data:

  local ok = client:send('hello')
  if ok then
     print('msg sent')
  else
     print('connection closed')
  end

  -- receive data:

  local message,opcode = client:receive()
  if message then
     print('msg',message,opcode)
  else
     print('connection closed')
  end

  -- close connection:

  local close_was_clean,close_code,close_reason = client:close(4001,'lost interest')
  print("===========End Trigger==============")
end
