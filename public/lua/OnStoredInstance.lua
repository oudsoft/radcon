function OnStoredInstance(instanceId, tags, metadata)
	print("===========OnStoredInstance==============")
	print(instanceId)
	print(tags)
	print(metadata)
	-- Delete(SendToPeer(instanceId, 'myshopman'))
	-- SendToPeer(instanceId, 'myshopman')
	SendToModality(instanceId, 'myshopman')
end
