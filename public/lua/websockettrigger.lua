function OnStoredInstance(instanceId, tags, metadata)
	print("===========OnStoredInstance==============")
	print(instanceId)
	print(tags)
	print(metadata)
	-- Delete(SendToPeer(instanceId, 'myshopman'))
	-- SendToPeer(instanceId, 'myshopman')
	SendToModality(instanceId, 'Nongjok')
end

function linuxSleep(n)
	os.execute("sleep " .. tonumber(n))
end

function windowsSleep(n)
	if n > 0 then os.execute("ping -n " .. tonumber(n+1) .. " localhost > NUL") end
end

function doReadFile(path)
	local open = io.open
	local file = open(path, "rb") -- r read mode and b binary mode
	if not file then return nil end
	local content = file:read "*a" -- *a or *all reads the whole file
	file:close()
	return content
end
-- local fileContent = doReadFile("foo.html");
-- print (fileContent);

function doDownloadDicom(dicomFilename)
	print("=========== Start Download Dicom ==============")
	local downloadcommand = ('curl --user limparty:Limparty -k https://172.17.0.6/webapp/img/usr/pdf/' .. dicomFilename .. ' -o ' .. dicomFilename)
	print("Run Command => " .. downloadcommand)
	os.execute(downloadcommand)
	print("=========== End Download Dicom ==============")
end

function doStoreDicom(dicomFilename)
	print("=========== Start Store Dicom ==============")
	local storecommand = ('curl -X POST --user demo:demo http://localhost:8042/instances --data-binary @' .. dicomFilename)
	print("Run Command => " .. storecommand)
	local response = os.execute(storecommand)
	print("The Response from Orthanc => " .. response)
	print("=========== End Store Dicom ==============")
end

function doStoreDicomWithApi(dicomFilename)
	print("=========== Start Store Dicom ==============")
	local uri = '/instances'
	local body = doReadFile(dicomFilename)
	local builin = true;
	local headers = {   ["content-type"] = "application/x-binary",  }
	RestApiPost(uri, body, builtin, headers)
	print("=========== End Store Dicom ==============")
end

function doLocalStore(dicomFilename)
	doDownloadDicom(dicomFilename)
	linuxSleep(3.5)
	doStoreDicom(dicomFilename)
end

-- doStoreDicom('c13eb9d9-7afe.dcm')
-- doLocalStore('c13eb9d9-7afe.dcm')
