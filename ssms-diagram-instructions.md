# How to Generate an ER Diagram in MSSQL Server Management Studio (SSMS)

To meet the requirement for **Deliverable 1 - Schema Design Requirements**, here is a step-by-step guide to generating your database diagram inside SSMS:

## Prerequisites
1. Ensure your database is successfully created by executing your `uniconnect-mssql-schema.sql` file in an SSMS query window.
2. Expand your server connection in the **Object Explorer** panel on the left side of your screen. 
3. Expand **Databases** and find your newly created database containing the tables.

## Steps to Generate the Diagram:

1. **Locate the Folder**
   Within your chosen database, right-click on the folder named **Database Diagrams**.

2. **Grant Diagram Access (If prompted)**
   If a prompt asks: *"This database does not have one or more of the support objects required to use database diagramming. Do you wish to create them?"*
   - Click **Yes**.

3. **Create New Diagram**
   Right-click **Database Diagrams** again and select **New Database Diagram**.

4. **Add Tables**
   An *"Add Table"* popup window will appear:
   - Select multiple tables (you can hold down `Shift` or `Ctrl` or press `Ctrl + A` inside the table list to select all your UniConnect tables).
   - Click the **Add** button.
   - Wait for SSMS to automatically place the tables onto your canvas. Once they are all added, click **Close**.

5. **Rearrange For Readability (CRITICAL)**
   As mentioned in your requirements, you need to make sure the diagram is "NOT ugly". 
   - Click and drag the table frames to reorganize them logically. 
   - Good practice is to place root entities (like `Users`) near the center or top left, placing dependency schemas (`GroupMembers`, `Transactions`, `Messages`) around their respective main entities.
   - Avoid intersecting relation lines as much as possible to ensure clarity. 
   - You can right click elements on the diagram space, and choose **Autosize Selected Tables** to fix hidden fields.

6. **Save and Export**
   - Click the `Save` icon (Floppy Disk) in the top left, and give the diagram a name (e.g., `UniConnect_Schema_Diagram`).
   - To extract it for your document deliverable, you can simply right-click anywhere empty inside the diagram view canvas and choose **Copy Diagram to Clipboard**, then paste it directly into your report (Word/PDF document). Alternatively, use the Snipping Tool to take a clean screenshot of your arrangement.
